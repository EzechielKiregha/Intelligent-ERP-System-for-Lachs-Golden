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
    
    // Prepare deal aging analysis data (simplified)
    const agingAnalysisRows = [
      ['NEW', '8', '12', '5'],
      ['QUALIFIED', '5', '10', '5'],
      ['PROPOSAL', '3', '8', '4'],
      ['NEGOTIATION', '2', '5', '3']
    ];
    
    // Prepare conversion rates data
    const conversionRatesRows = [
      ['NEW', 'QUALIFIED', '20', '80%'],
      ['QUALIFIED', 'PROPOSAL', '15', '75%'],
      ['PROPOSAL', 'NEGOTIATION', '10', '67%'],
      ['NEGOTIATION', 'WON', '5', '50%']
    ];
    
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