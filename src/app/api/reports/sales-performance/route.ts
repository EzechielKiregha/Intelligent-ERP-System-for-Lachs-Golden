// app/api/reports/sales-performance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { DealStage, Role } from '@/generated/prisma';
import { generateReportPdf, ContentSection } from '@/lib/pdf/pdfGenerator';
import { format } from 'date-fns';

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.currentCompanyId ){
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = session.user.currentCompanyId;
    
    // 2. Get date range (simplified for demo)
    const end = new Date();
    const start = new Date(end);
    start.setMonth(end.getMonth() - 1);
    
    // 3. Fetch real data from database
    const [totalDeals, wonDeals, lostDeals] = await Promise.all([
      prisma.deal.count({
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
          createdAt: { gte: start, lte: end }
        }
      }),
      prisma.deal.count({
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
          stage: 'WON',
          createdAt: { gte: start, lte: end }
        }
      }),
      prisma.deal.count({
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
          stage: 'LOST',
          createdAt: { gte: start, lte: end }
        }
      }),
    ]);

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
        stage: 'WON',
        createdAt: { gte: start, lte: end }
      },
      select: { amount: true }
    });

    const totalRevenue = deals.reduce((sum, deal) => sum + deal.amount, 0);
    const conversionRate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0;
    const averageDealValue = wonDeals > 0 ? totalRevenue / wonDeals : 0;
    
    // 4. Fetch additional real data from database
    
    // Get sales reps performance data
    const salesReps = await prisma.user.findMany({
      where: { 
        currentCompanyId: companyId,
        role: {in:[Role.SUPER_ADMIN, Role.ADMIN, Role.ACCOUNTANT, Role.EMPLOYEE, Role.HR,
          Role.MANAGER, Role.MEMBER
        ]}
      },
      include: {
        deals: {
          where: {
            createdAt: { gte: start, lte: end }
          }
        }
      }
    });

    // Calculate performance metrics for each sales rep
    const topRepsRows = salesReps
      .map(rep => {
        const repDeals = rep.deals || [];
        const totalRepDeals = repDeals.length;
        const wonRepDeals = repDeals.filter(d => d.stage === 'WON').length;
        const repRevenue = repDeals
          .filter(d => d.stage === 'WON')
          .reduce((sum, deal) => sum + deal.amount, 0);
        const repConversionRate = totalRepDeals > 0 ? (wonRepDeals / totalRepDeals) * 100 : 0;
        
        return [
          `${rep.firstName} ${rep.lastName}`,
          wonRepDeals.toString(),
          `$${repRevenue.toFixed(2)}`,
          `${repConversionRate.toFixed(1)}%`
        ];
      })
      .sort((a, b) => parseFloat(b[2].replace('$', '')) - parseFloat(a[2].replace('$', '')))
      .slice(0, 5); // Get top 5 reps by revenue
    
    // If no sales reps data, add a placeholder row
    if (topRepsRows.length === 0) {
      topRepsRows.push(['No sales representatives data available', '0', '$0.00', '0%']);
    }
    
    // Get deal stage analysis data
    const stages = [DealStage.NEW, DealStage.NEGOTIATION, DealStage.PROPOSAL, DealStage.QUALIFIED,
      DealStage.LOST, DealStage.WON
     ]
    
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
          stage,
          createdAt: { gte: start, lte: end }
        },
        select: { amount: true }
      });
      
      const stageDealCount = stageDeals.length;
      const stageValue = stageDeals.reduce((sum, deal) => sum + deal.amount, 0);
      const stageAvgValue = stageDealCount > 0 ? stageValue / stageDealCount : 0;
      
      // Calculate conversion rate based on next stage
      let conversionRate = 'N/A';
      if (stage !== 'WON' && stage !== 'LOST') {
        const nextStageIndex = stages.indexOf(stage) + 1;
        if (nextStageIndex < stages.length - 1) { // Exclude LOST from next stage calculation
          const nextStage = stages[nextStageIndex];
          const nextStageCount = await prisma.deal.count({
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
              stage: nextStage,
              createdAt: { gte: start, lte: end }
            }
          });
          
          if (stageDealCount > 0) {
            const rate = (nextStageCount / stageDealCount) * 100;
            conversionRate = `${rate.toFixed(1)}%`;
          }
        }
      } else if (stage === 'WON') {
        conversionRate = '100%';
      } else if (stage === 'LOST') {
        conversionRate = '0%';
      }
      
      return [
        stage,
        stageDealCount.toString(),
        `$${stageAvgValue.toFixed(2)}`,
        conversionRate
      ];
    });
    
    const stageAnalysisRows = await Promise.all(stagePromises);
    
    // 7. Create sections for the new PDF generator
    const sections: ContentSection[] = [
      {
        title: 'Sales Performance Summary',
        type: 'keyValue',
        data: {
          'Total Deals:': totalDeals.toString(),
          'Won Deals:': wonDeals.toString(),
          'Lost Deals:': lostDeals.toString(),
          'Conversion Rate:': `${conversionRate.toFixed(1)}%`,
          'Total Revenue:': `$${totalRevenue.toFixed(2)}`,
          'Average Deal Value:': `$${averageDealValue.toFixed(2)}`
        }
      },
      {
        title: 'Top Performing Sales Representatives',
        type: 'table',
        data: {
          headers: ['Sales Rep', 'Deals Won', 'Revenue', 'Conversion Rate'],
          rows: topRepsRows
        }
      },
      {
        title: 'Deal Stage Analysis',
        type: 'table',
        data: {
          headers: ['Stage', 'Deals', 'Avg. Value', 'Conversion Rate'],
          rows: stageAnalysisRows
        }
      }
    ];
    
    // 8. Generate PDF with the new generator
    const pdfBuffer = await generateReportPdf(
      sections,
      'Lachs Golden - Sales Performance Report',
      `Last 30 Days (${format(start, 'MMM dd')} to ${format(end, 'MMM dd')})`
    );
    
    // 9. Return PDF response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="sales-performance-${format(new Date(), 'yyyy-MM-dd')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating sales performance report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}