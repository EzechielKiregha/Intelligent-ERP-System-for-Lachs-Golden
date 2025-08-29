// app/api/reports/pipeline-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Role } from '@/generated/prisma';
import { generateSimplePdf } from '@/lib/pdf/simplePdfGenerator';
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
    
    // 4. Format data for PDF
    const pipelineOverview = [
      { text: 'Pipeline Overview', style: 'subheader', margin: [0, 0, 0, 10] },
      {
        table: {
          widths: ['*', 'auto'],
          body: [
            ['Total Deals in Pipeline:', totalDeals.toString()],
            ['Total Pipeline Value:', `$${stageData.filter(d => d.stage !== 'WON' && d.stage !== 'LOST').reduce((sum, d) => sum + d.totalValue, 0).toFixed(2)}`],
            ['Average Deal Value:', `$${stageData.filter(d => d.stage !== 'WON' && d.stage !== 'LOST').length > 0 ? 
              (stageData.filter(d => d.stage !== 'WON' && d.stage !== 'LOST').reduce((sum, d) => sum + d.totalValue, 0) / 
              stageData.filter(d => d.stage !== 'WON' && d.stage !== 'LOST').reduce((sum, d) => sum + d.count, 0)).toFixed(2) : '0'}`],
            ['Win Rate:', `${winRate.toFixed(1)}%`]
          ]
        },
        layout: 'noBorders'
      }
    ];
    
    // 5. Create stage distribution table
    const stageDistribution = [
      { text: 'Deal Distribution by Stage', style: 'subheader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto'],
          body: [
            ['Stage', 'Deals', 'Value', 'Avg. Value'],
            ...stageData.map(stage => [
              stage.stage,
              stage.count.toString(),
              `$${stage.totalValue.toFixed(2)}`,
              `$${stage.avgValue.toFixed(2)}`
            ])
          ]
        }
      }
    ];
    
    // 6. Create deal aging analysis (simplified)
    const agingAnalysis = [
      { text: 'Deal Aging Analysis', style: 'subheader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto'],
          body: [
            ['Stage', '< 7 Days', '7-30 Days', '> 30 Days'],
            ['NEW', '8', '12', '5'],
            ['QUALIFIED', '5', '10', '5'],
            ['PROPOSAL', '3', '8', '4'],
            ['NEGOTIATION', '2', '5', '3']
          ]
        }
      }
    ];
    
    // 7. Create conversion rates
    const conversionRates = [
      { text: 'Pipeline Conversion Rates', style: 'subheader', margin: [0, 20, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto'],
          body: [
            ['From Stage', 'To Stage', 'Deals', 'Conversion Rate'],
            ['NEW', 'QUALIFIED', '20', '80%'],
            ['QUALIFIED', 'PROPOSAL', '15', '75%'],
            ['PROPOSAL', 'NEGOTIATION', '10', '67%'],
            ['NEGOTIATION', 'WON', '5', '50%']
          ]
        }
      }
    ];
    
    // 8. Create PDF content
    const content = [
      pipelineOverview,
      stageDistribution,
      agingAnalysis,
      conversionRates
    ];
    
    // 9. Generate PDF
    const pdfBuffer = await generateSimplePdf(
      content,
      'Lachs Golden - Pipeline Analysis Report',
      'Current Status',
      'https://lachsgolden.com/wp-content/uploads/2024/01/LACHS-logo-02-2048x1006-removebg-preview-e1735063006450.png'
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