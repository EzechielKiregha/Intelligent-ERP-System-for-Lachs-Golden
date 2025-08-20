// app/api/reports/crm/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { any, z } from 'zod';
import { DealStage, Role } from '@/generated/prisma';
import { Logs } from 'lucide-react';

// Supported CRM report types
const CRM_REPORT_TYPES = [
  'sales-performance',
  'pipeline-analysis',
  'contact-engagement',
  'forecast-report',
] as const;

type CRMReportType = (typeof CRM_REPORT_TYPES)[number];

// Date range options
const DATE_RANGES = ['last7days', 'last30days', 'lastquarter', 'lastyear'] as const;
type DateRange = (typeof DATE_RANGES)[number];

// Input validation
const ReportSchema = z.object({
  type: z.enum(CRM_REPORT_TYPES),
  dateRange: z.enum(DATE_RANGES).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Auth & Role Check
    const session = await getServerSession(authOptions);
    if (!session?.user?.currentCompanyId || 
        (session.user.role !== Role.ADMIN && session.user.role !== Role.SUPER_ADMIN)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = session.user.currentCompanyId;

    // 2. Parse Request Body
    const body = await req.json();
    const parseResult = ReportSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const { type, dateRange } = parseResult.data;

    // 3. Determine Date Range
    const now = new Date();
    let start: Date, end: Date;

    switch (dateRange) {
      case 'last7days':
        start = new Date(now.setDate(now.getDate() - 7));
        end = new Date();
        break;
      case 'last30days':
        start = new Date(now.setDate(now.getDate() - 30));
        end = new Date();
        break;
      case 'lastquarter':
        start = new Date(now.setMonth(now.getMonth() - 3));
        end = new Date();
        break;
      case 'lastyear':
        start = new Date(now.setFullYear(now.getFullYear() - 1));
        end = new Date();
        break;
      default:
        start = new Date(now.setDate(now.getDate() - 30));
        end = new Date();
    }
    end.setHours(23, 59, 59, 999);

    // 4. Generate Report Data
    let reportData;
    let headers: string[] = [];
    let rows: string[] = [];
    let filename: string;

    switch (type) {
      case 'sales-performance':
        reportData = await generateSalesPerformanceReport(companyId, start, end);
        headers = ['Metric', 'Value', 'Period'];
        rows = [
          `Total Deals,${reportData.totalDeals},${dateRange}`,
          `Won Deals,${reportData.wonDeals},${dateRange}`,
          `Lost Deals,${reportData.lostDeals},${dateRange}`,
          `Conversion Rate,${reportData.conversionRate.toFixed(1)}%,${dateRange}`,
          `Average Deal Value,${reportData.averageDealValue.toLocaleString()},${dateRange}`,
          `Total Revenue,${reportData.totalRevenue.toLocaleString()},${dateRange}`,
        ];
        filename = `sales-performance_${formatDate(start)}_to_${formatDate(end)}.csv`;
        break;

      case 'pipeline-analysis':
        reportData = await generatePipelineAnalysisReport(companyId);
        headers = ['Stage', 'Deals', 'Total Value', 'Avg. Deal Value'];
        rows = Object.entries(reportData.stageDistribution).map(([stage, data]) => {
          return [
            stage,
            data.count.toString(),
            data.totalValue.toLocaleString(),
            data.avgValue.toLocaleString(),
          ].join(',');
        });
        filename = `pipeline-analysis_${formatDate(start)}_to_${formatDate(end)}.csv`;
        break;

      case 'contact-engagement':
        reportData = await generateContactEngagementReport(companyId, start, end);
        headers = ['Contact', 'Email', 'Total Interactions', 'Last Contact', 'Engagement Score'];
        rows = reportData.contacts.map(c => {
          return [
            c.fullName,
            c.email,
            c.interactionCount.toString(),
            c.lastInteraction ? new Date(c.lastInteraction).toISOString() : 'Never',
            c.engagementScore.toFixed(1),
          ].join(',');
        });
        filename = `contact-engagement_${formatDate(start)}_to_${formatDate(end)}.csv`;
        break;

      case 'forecast-report':
        reportData = await generateForecastReport(companyId);
        headers = ['Metric', 'Current', 'Forecast (30d)', 'Forecast (90d)'];
        rows = [
          `Total Pipeline,${reportData.currentPipeline.toLocaleString()},${reportData.forecast30.toLocaleString()},${reportData.forecast90.toLocaleString()}`,
          `Expected Revenue,${reportData.expectedRevenue.toLocaleString()},${reportData.expectedRevenue30.toLocaleString()},${reportData.expectedRevenue90.toLocaleString()}`,
          `Win Rate,${reportData.winRate.toFixed(1)}%,${reportData.forecastWinRate.toFixed(1)}%,${reportData.forecastWinRate.toFixed(1)}%`,
        ];
        filename = `forecast-report_${formatDate(start)}_to_${formatDate(end)}.csv`;
        break;

      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    // 5. Build CSV
    const csvContent = [headers.join(','), ...rows].join('\r\n');

    // 6. Return CSV Response
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating CRM report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

// Helper functions for report generation
async function generateSalesPerformanceReport(companyId: string, start: Date, end: Date) {
  const [totalDeals, wonDeals, lostDeals] = await Promise.all([
    prisma.deal.count({
      where: { 
        contact: { 
          company: { 
            users: { 
              some: { 
                id: (await getServerSession(authOptions))?.user?.id 
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
                id: (await getServerSession(authOptions))?.user?.id 
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
                id: (await getServerSession(authOptions))?.user?.id 
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
              id: (await getServerSession(authOptions))?.user?.id 
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

  return {
    totalDeals,
    wonDeals,
    lostDeals,
    conversionRate,
    averageDealValue,
    totalRevenue
  };
}

async function generatePipelineAnalysisReport(companyId: string) {
  const stages = ['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'] as const;
  
  const stageData = await Promise.all(
    stages.map(async stage => {
      const deals = await prisma.deal.findMany({
        where: { 
          contact: { 
            company: { 
              users: { 
                some: { 
                  id: (await getServerSession(authOptions))?.user?.id 
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

  const stageDistribution = stageData.reduce((acc, stage) => {
    acc[stage.stage] = {
      count: stage.count,
      totalValue: stage.totalValue,
      avgValue: stage.avgValue
    };
    return acc;
  }, {} as Record<string, { count: number; totalValue: number; avgValue: number }>);

  return { stageDistribution };
}

async function generateContactEngagementReport(companyId: string, start: Date, end: Date) {
  const contacts = await prisma.contact.findMany({
    where: { 
      company: { 
        users: { 
          some: { 
            id: (await getServerSession(authOptions))?.user?.id 
          } 
        } 
      }
    },
    include: {
      logs: {
        where: { timestamp: { gte: start, lte: end } },
        orderBy: { timestamp: 'desc' }
      },
      deals: true
    }
  });

  const contactReports = Promise.all(contacts.map(async (contact) => {
    const logs = await prisma.communicationLog.findMany({
      where: {
        contactId : contact.id,
        timestamp: { gte: start, lte: end }
        },
        orderBy: { timestamp: 'desc' }
    })

    const deals = await prisma.deal.findMany({
      where : {
        contactId : contact.id
      }
    })
    const interactionCount = Logs.length ;
    const lastInteraction = interactionCount > 0 ? logs[0].timestamp : null;
    
    // Calculate engagement score (simplified)
    let engagementScore = 0;
    if (interactionCount > 5) engagementScore += 30;
    else if (interactionCount > 2) engagementScore += 20;
    else engagementScore += 10;
    
    if (deals.some((d: any) => d.stage === 'WON')) engagementScore += 40;
    else if (deals.length > 0) engagementScore += 20;
    
    if (lastInteraction && new Date(lastInteraction) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
      engagementScore += 30;
    }

    return {
      id: contact.id,
      fullName: contact.fullName,
      email: contact.email,
      interactionCount,
      lastInteraction,
      engagementScore: Math.min(engagementScore, 100)
    };
  }))

  const contactReps = Promise.resolve(contactReports)

  return {
    contacts: (await contactReps).sort((a, b) => b.engagementScore - a.engagementScore)
  };
}

async function generateForecastReport(companyId: string) {
  const [allDeals, wonDeals] = await Promise.all([
    prisma.deal.findMany({
      where: { 
        contact: { 
          company: { 
            users: { 
              some: { 
                id: (await getServerSession(authOptions))?.user?.id 
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
                id: (await getServerSession(authOptions))?.user?.id 
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

  // Simple forecast (could be improved with more sophisticated models)
  const forecast30 = totalPipeline * (winRate / 100) * 0.8;
  const forecast90 = totalPipeline * (winRate / 100) * 0.6;
  const expectedRevenue30 = expectedRevenue * 1.1;
  const expectedRevenue90 = expectedRevenue * 1.3;
  const forecastWinRate = Math.min(winRate * 1.05, 100);

  return {
    currentPipeline: totalPipeline,
    expectedRevenue,
    winRate,
    forecast30,
    forecast90,
    expectedRevenue30,
    expectedRevenue90,
    forecastWinRate
  };
}

// Helper: Format date for filename
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}