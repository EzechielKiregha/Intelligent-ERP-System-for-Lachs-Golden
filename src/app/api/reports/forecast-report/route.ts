// app/api/reports/forecast-report/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { DealStage, Role } from '@/generated/prisma';
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
    const [allDeals, wonDeals] = await Promise.all([
      prisma.deal.findMany({
        where: { 
          contact: { 
            company: { 
              users: { 
                some: { 
                  id: session.user.id 
                } 
              } 
            } 
          }
        },
        include: {
          contact: true
        }
      }),
      prisma.deal.findMany({
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
          stage: 'WON'
        },
        include: {
          contact: true
        }
      })
    ]);

    const totalPipeline = allDeals.reduce((sum, deal) => sum + deal.amount, 0);
    const expectedRevenue = wonDeals.reduce((sum, deal) => sum + deal.amount, 0);
    const winRate = allDeals.length > 0 ? (wonDeals.length / allDeals.length) * 100 : 0;

    // 3. Calculate forecast metrics
    const forecast30 = totalPipeline * (winRate / 100) * 0.8;
    const forecast90 = totalPipeline * (winRate / 100) * 0.6;
    const expectedRevenue30 = expectedRevenue * 1.1;
    const expectedRevenue90 = expectedRevenue * 1.3;
    const forecastWinRate = Math.min(winRate * 1.05, 100);
    
    // 4. Format data for the new PDF generator
    
    // Prepare forecast summary data
    const forecastSummaryRows = [
      ['Win Rate', `${winRate.toFixed(1)}%`, `${forecastWinRate.toFixed(1)}%`, `${forecastWinRate.toFixed(1)}%`],
      ['Expected Revenue', `$${expectedRevenue.toFixed(2)}`, `$${expectedRevenue30.toFixed(2)}`, `$${expectedRevenue90.toFixed(2)}`],
      ['Pipeline Value', `$${totalPipeline.toFixed(2)}`, `$${forecast30.toFixed(2)}`, `$${forecast90.toFixed(2)}`]
    ];
    
    // Get stage forecast data from real deals
    const stages = [DealStage.NEW, DealStage.QUALIFIED, DealStage.PROPOSAL, DealStage.NEGOTIATION];
    
    const stagePromises = stages.map(async (stage) => {
      const stageDeals = await prisma.deal.findMany({
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
        include: {
          contact: true
        }
      });
      
      const currentValue = stageDeals.reduce((sum, deal) => sum + deal.amount, 0);
      // Calculate forecast value based on stage (higher stages have higher probability)
      const stageIndex = stages.indexOf(stage);
      const stageProbability = 0.3 + (stageIndex * 0.15); // 30%, 45%, 60%, 75%
      const forecastValue = currentValue * stageProbability;
      
      return [
        stage,
        `$${currentValue.toFixed(2)}`,
        `$${forecastValue.toFixed(2)}`
      ];
    });
    
    const stageForecastRows = await Promise.all(stagePromises);
    
    // If no stage data, add a placeholder row
    if (stageForecastRows.length === 0) {
      stageForecastRows.push(['No stage data available', '$0.00', '$0.00']);
    }
    
    // Get top opportunities from real deals
    const topDeals = await prisma.deal.findMany({
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
          in: ['QUALIFIED', 'PROPOSAL', 'NEGOTIATION'] // Only include active deals
        }
      },
      orderBy: {
        amount: 'desc'
      },
      take: 5, // Get top 5 deals by amount
      include: {
        contact: true
      }
    });
    
    const topOpportunitiesRows = await Promise.all(topDeals.map(async (deal) => {
      // Calculate probability based on stage
      let probability = '30%';
      if (deal.stage === 'NEGOTIATION') {
        probability = '70%';
      } else if (deal.stage === 'PROPOSAL') {
        probability = '50%';
      }
      
      // Get contact name using contactId
      const contact = await prisma.contact.findUnique({
        where: { id: deal.contactId },
        select: { fullName: true }
      });
      
      // Estimate close date based on created date (if available) or use current date + random days
      const closeDate = deal.expectedCloseDate || new Date(Date.now() + (Math.floor(Math.random() * 60) + 15) * 24 * 60 * 60 * 1000);
      
      return [
        deal.title || `Deal with ${contact?.fullName || 'Unknown'}`,
        deal.stage,
        `$${deal.amount.toFixed(2)}`,
        format(closeDate, 'MMM dd'),
        probability
      ];
    }));
    
    // If no top deals, add a placeholder row
    if (topOpportunitiesRows.length === 0) {
      topOpportunitiesRows.push(['No active deals available', 'N/A', '$0.00', format(new Date(), 'MMM dd'), '0%']);
    }
    
    // Calculate forecast confidence based on real deals
    const highConfidenceDeals = allDeals.filter(d => d.stage === 'NEGOTIATION');
    const mediumConfidenceDeals = allDeals.filter(d => d.stage === 'PROPOSAL');
    const lowConfidenceDeals = allDeals.filter(d => ['NEW', 'QUALIFIED'].includes(d.stage));
    
    const highConfidenceValue = highConfidenceDeals.reduce((sum, deal) => sum + deal.amount, 0);
    const mediumConfidenceValue = mediumConfidenceDeals.reduce((sum, deal) => sum + deal.amount, 0);
    const lowConfidenceValue = lowConfidenceDeals.reduce((sum, deal) => sum + deal.amount, 0);
    
    const highConfidenceWinRate = 75;
    const mediumConfidenceWinRate = 50;
    const lowConfidenceWinRate = 25;
    
    const forecastConfidenceRows = [
      ['High Confidence (>70%)', highConfidenceDeals.length.toString(), `$${highConfidenceValue.toFixed(2)}`, `${highConfidenceWinRate}%`],
      ['Medium Confidence (40-70%)', mediumConfidenceDeals.length.toString(), `$${mediumConfidenceValue.toFixed(2)}`, `${mediumConfidenceWinRate}%`],
      ['Low Confidence (<40%)', lowConfidenceDeals.length.toString(), `$${lowConfidenceValue.toFixed(2)}`, `${lowConfidenceWinRate}%`]
    ];
    
    // 8. Create sections for the new PDF generator
    const sections: ContentSection[] = [
      {
        title: 'Sales Forecast',
        type: 'table',
        data: {
          headers: ['', 'Current', '30-Day', '90-Day'],
          rows: forecastSummaryRows
        }
      },
      {
        title: 'Deal Stage Forecast',
        type: 'table',
        data: {
          headers: ['Stage', 'Current Value', 'Forecast Value'],
          rows: stageForecastRows
        }
      },
      {
        title: 'Top Opportunities',
        type: 'table',
        data: {
          headers: ['Deal', 'Stage', 'Value', 'Close Date', 'Probability'],
          rows: topOpportunitiesRows
        }
      },
      {
        title: 'Forecast Confidence',
        type: 'table',
        data: {
          headers: ['Confidence Level', 'Deals', 'Value', 'Win Rate'],
          rows: forecastConfidenceRows
        }
      }
    ];
    
    // 9. Generate PDF with the new generator
    const pdfBuffer = await generateReportPdf(
      sections,
      'Lachs Golden - Sales Forecast Report',
      'Current Status'
    );
    
    // 10. Return PDF response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="forecast-report-${format(new Date(), 'yyyy-MM-dd')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating forecast report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}