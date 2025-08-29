// app/api/reports/pipeline-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Role } from '@/generated/prisma';
import { ContentSection, generateReportPdf } from '@/lib/pdf/puppeteerPdfGenerator';
import { format } from 'date-fns';

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.currentCompanyId ){
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = session.user.currentCompanyId;
    
    // 2. Fetch real data from database
    const stages = ['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'] as const;
    
    const stageData = await Promise.all(
      stages.map(async stage => {
        const deals = await prisma.deal.findMany({
          where: { 
            contact: { 
              company: { 
                users: { 
                  some: { 
                    id: session.user.id 
                  } 
                } 
              } 
            },
            stage
          },
          select: { amount: true }
        });

        const totalValue = deals.reduce((sum, deal) => sum + deal.amount, 0);
        const avgValue = deals.length > 0 ? totalValue / deals.length : 0;

        return {
          stage,
          count: deals.length,
          totalValue,
          avgValue
        };
      })
    );

    // 3. Calculate pipeline health metrics
    const wonDeals = stageData.find(d => d.stage === 'WON')?.count || 0;
    const totalDeals = stageData.filter(d => d.stage !== 'WON' && d.stage !== 'LOST').reduce((sum, d) => sum + d.count, 0);
    const winRate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0;
    
    // 4. Format data for the new PDF generator
    
    // Calculate pipeline metrics
    const totalPipelineValue = stageData
      .filter(d => d.stage !== 'WON' && d.stage !== 'LOST')
      .reduce((sum, d) => sum + d.totalValue, 0);
      
    const avgDealValue = stageData.filter(d => d.stage !== 'WON' && d.stage !== 'LOST').length > 0 
      ? (totalPipelineValue / totalDeals)
      : 0;
    
    // Prepare stage distribution data
    const stageDistributionRows = stageData.map(stage => [
      stage.stage,
      stage.count.toString(),
      `$${stage.totalValue.toFixed(2)}`,
      `$${stage.avgValue.toFixed(2)}`
    ]);
    
    // Get all deals with creation dates for aging analysis
    const dealsWithDates = await prisma.deal.findMany({
      where: { 
        contact: { 
          company: { 
            users: { 
              some: { 
                id: session.user.id 
              } 
            } 
          } 
        },
        stage: {
          in: ['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION'] // Only active deals
        }
      },
      select: {
        stage: true,
        createdAt: true
      }
    });
    
    // Calculate deal aging
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    // Initialize aging data structure
    const agingData = {
      'NEW': { lessThan7: 0, between7And30: 0, moreThan30: 0 },
      'QUALIFIED': { lessThan7: 0, between7And30: 0, moreThan30: 0 },
      'PROPOSAL': { lessThan7: 0, between7And30: 0, moreThan30: 0 },
      'NEGOTIATION': { lessThan7: 0, between7And30: 0, moreThan30: 0 }
    };
    
    // Populate aging data
    dealsWithDates.forEach(deal => {
      // Type guard to ensure the stage exists in agingData
      if (deal.stage in agingData) {
        const createdAt = new Date(deal.createdAt);
        if (createdAt > sevenDaysAgo) {
          agingData[deal.stage as keyof typeof agingData].lessThan7++;
        } else if (createdAt > thirtyDaysAgo) {
          agingData[deal.stage as keyof typeof agingData].between7And30++;
        } else {
          agingData[deal.stage as keyof typeof agingData].moreThan30++;
        }
      }
    });
    
    // Format aging data for display
    const agingAnalysisRows = Object.entries(agingData).map(([stage, data]) => [
      stage,
      data.lessThan7.toString(),
      data.between7And30.toString(),
      data.moreThan30.toString()
    ]);
    
    // Calculate conversion rates between stages
    const conversionRates = [];
    
    // For each stage pair, calculate conversion rate
    for (let i = 0; i < stages.length - 2; i++) { // Exclude LOST
      const fromStage = stages[i];
      const toStage = stages[i + 1];
      
      // Count deals in each stage
      const fromStageCount = stageData.find(d => d.stage === fromStage)?.count || 0;
      const toStageCount = stageData.find(d => d.stage === toStage)?.count || 0;
      
      // Calculate conversion rate
      const conversionRate = fromStageCount > 0 ? (toStageCount / fromStageCount) * 100 : 0;
      
      conversionRates.push({
        fromStage,
        toStage,
        count: toStageCount,
        rate: conversionRate
      });
    }
    
    // Format conversion rates for display
    const conversionRatesRows = conversionRates.map(cr => [
      cr.fromStage,
      cr.toStage,
      cr.count.toString(),
      `${cr.rate.toFixed(1)}%`
    ]);
    
    // 8. Create sections for the new PDF generator
    const sections: ContentSection[] = [
      {
        title: 'Pipeline Overview',
        type: 'keyValue',
        data: {
          'Total Deals in Pipeline:': totalDeals.toString(),
          'Total Pipeline Value:': `$${totalPipelineValue.toFixed(2)}`,
          'Average Deal Value:': `$${avgDealValue.toFixed(2)}`,
          'Win Rate:': `${winRate.toFixed(1)}%`
        }
      },
      {
        title: 'Deal Distribution by Stage',
        type: 'table',
        data: {
          headers: ['Stage', 'Deals', 'Value', 'Avg. Value'],
          rows: stageDistributionRows
        }
      },
      {
        title: 'Deal Aging Analysis',
        type: 'table',
        data: {
          headers: ['Stage', '< 7 Days', '7-30 Days', '> 30 Days'],
          rows: agingAnalysisRows
        }
      },
      {
        title: 'Pipeline Conversion Rates',
        type: 'table',
        data: {
          headers: ['From Stage', 'To Stage', 'Deals', 'Conversion Rate'],
          rows: conversionRatesRows
        }
      }
    ];
    
    // 9. Generate PDF with the new generator
    const pdfBuffer = await generateReportPdf(
      sections,
      'Lachs Golden - Pipeline Analysis Report',
      'Current Status'
    );
    
    // 10. Return PDF response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="pipeline-analysis-${format(new Date(), 'yyyy-MM-dd')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating pipeline analysis report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}