// app/api/reports/forecast-report/route.ts
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
    
    // Prepare stage forecast data
    const stageForecastRows = [
      ['NEW', '$50,000', '$40,000'],
      ['QUALIFIED', '$40,000', '$32,000'],
      ['PROPOSAL', '$30,000', '$24,000'],
      ['NEGOTIATION', '$20,000', '$16,000']
    ];
    
    // Prepare top opportunities data
    const topOpportunitiesRows = [
      ['Enterprise Contract', 'NEGOTIATION', '$50,000', format(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), 'MMM dd'), '70%'],
      ['Mid-Market Expansion', 'PROPOSAL', '$35,000', format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'MMM dd'), '50%'],
      ['Small Business Package', 'QUALIFIED', '$20,000', format(new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), 'MMM dd'), '30%']
    ];
    
    // Prepare forecast confidence data
    const forecastConfidenceRows = [
      ['High Confidence (>70%)', '15', '$150,000', '75%'],
      ['Medium Confidence (40-70%)', '25', '$250,000', '50%'],
      ['Low Confidence (<40%)', '10', '$100,000', '25%']
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