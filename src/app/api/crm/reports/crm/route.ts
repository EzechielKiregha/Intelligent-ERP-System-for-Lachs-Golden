// // app/api/crm/reports/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import prisma from '@/lib/prisma';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/lib/auth';
// import { z } from 'zod';
// import { DealStage, Role } from '@/generated/prisma';
// import { generatePDF, ReportType, ReportData, CompanyInfo } from '@/lib/pdf/generateReport';

// // Supported CRM report types
// const CRM_REPORT_TYPES = [
//   'sales-performance',
//   'pipeline-analysis',
//   'contact-engagement',
//   'forecast-report',
// ] as const;

// type CRMReportType = (typeof CRM_REPORT_TYPES)[number];

// // Date range options
// const DATE_RANGES = ['last7days', 'last30days', 'lastquarter', 'lastyear'] as const;
// type DateRange = (typeof DATE_RANGES)[number];

// // Input validation
// const ReportSchema = z.object({
//   type: z.enum(CRM_REPORT_TYPES),
//   dateRange: z.enum(DATE_RANGES).optional(),
// });

// export async function POST(req: NextRequest) {
//   try {
//     // 1. Auth & Role Check
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.currentCompanyId || 
//         (session.user.role !== Role.ADMIN && session.user.role !== Role.SUPER_ADMIN)) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const companyId = session.user.currentCompanyId;

//     // 2. Parse Request Body
//     const body = await req.json();
//     const parseResult = ReportSchema.safeParse(body);

//     if (!parseResult.success) {
//       return NextResponse.json(
//         { error: 'Invalid request', details: parseResult.error.errors },
//         { status: 400 }
//       );
//     }

//     const { type, dateRange } = parseResult.data;

//     // 3. Determine Date Range
//     const now = new Date();
//     let start: Date, end: Date;

//     switch (dateRange) {
//       case 'last7days':
//         start = new Date(now.setDate(now.getDate() - 7));
//         end = new Date();
//         break;
//       case 'last30days':
//         start = new Date(now.setDate(now.getDate() - 30));
//         end = new Date();
//         break;
//       case 'lastquarter':
//         start = new Date(now.setMonth(now.getMonth() - 3));
//         end = new Date();
//         break;
//       case 'lastyear':
//         start = new Date(now.setFullYear(now.getFullYear() - 1));
//         end = new Date();
//         break;
//       default:
//         start = new Date(now.setDate(now.getDate() - 30));
//         end = new Date();
//     }
//     end.setHours(23, 59, 59, 999);

//     // 4. Get company information for branding
//     const company = await prisma.company.findUnique({
//       where: { id: companyId },
//       select: {
//         name: true,
//         addressLine1: true,
//         addressLine2: true,
//         city: true,
//         state: true,
//         postalCode: true,
//         country: true,
//         contactPhone: true,
//         contactEmail: true,
//         website: true
//       }
//     });

//     if (!company) {
//       return NextResponse.json({ error: 'Company not found' }, { status: 404 });
//     }

//     const companyInfo: CompanyInfo = {
//       name: company.name,
//       address: company.addressLine1 || '',
//       address2: company.addressLine2 || '',
//       city: company.city || '',
//       state: company.state || '',
//       zip: company.postalCode || '',
//       country: company.country || '',
//       phone: company.contactPhone || '',
//       email: company.contactEmail || '',
//       website: company.website || '',
//       logoUrl: '' // Will be handled in browser environment
//     };

//     // 5. Generate Report Data
//     let reportData: ReportData;
//     let dateRangeLabel: string;

//     switch (dateRange) {
//       case 'last7days':
//         dateRangeLabel = 'Last 7 Days';
//         break;
//       case 'last30days':
//         dateRangeLabel = 'Last 30 Days';
//         break;
//       case 'lastquarter':
//         dateRangeLabel = 'Last Quarter';
//         break;
//       case 'lastyear':
//         dateRangeLabel = 'Last Year';
//         break;
//       default:
//         dateRangeLabel = 'Last 30 Days';
//     }

//     // Generate appropriate report data based on type
//     switch (type) {
//       case 'sales-performance':
//         reportData = await generateSalesPerformanceReport(companyId, start, end);
//         break;
        
//       case 'pipeline-analysis':
//         reportData = await generatePipelineAnalysisReport(companyId);
//         break;
        
//       case 'contact-engagement':
//         reportData = await generateContactEngagementReport(companyId, start, end);
//         break;
        
//       case 'forecast-report':
//         reportData = await generateForecastReport(companyId);
//         break;
        
//       default:
//         return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
//     }

//     // 6. Generate PDF
//     const pdfBuffer = await generatePDF(type, reportData, dateRangeLabel, companyInfo);

//     // 7. Return PDF Response
//     const filename = `${type.replace(/-/g, '_')}_report_${formatDate(start)}_to_${formatDate(end)}.pdf`;
    
//     return new NextResponse(pdfBuffer, {
//       status: 200,
//       headers: {
//         'Content-Type': 'application/pdf',
//         'Content-Disposition': `attachment; filename="${filename}"`,
//       },
//     });
//   } catch (error) {
//     console.error('Error generating CRM report:', error);
//     return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
//   }
// }

// // Helper functions for report generation
// async function generateSalesPerformanceReport(companyId: string, start: Date, end: Date): Promise<ReportData> {
//   const [totalDeals, wonDeals, lostDeals] = await Promise.all([
//     prisma.deal.count({
//       where: { 
//         contact: { 
//           company: { 
//             users: { 
//               some: { 
//                 id: (await getServerSession(authOptions))?.user?.id 
//               } 
//             } 
//           } 
//         },
//         createdAt: { gte: start, lte: end }
//       }
//     }),
//     prisma.deal.count({
//       where: { 
//         contact: { 
//           company: { 
//             users: { 
//               some: { 
//                 id: (await getServerSession(authOptions))?.user?.id 
//               } 
//             } 
//           } 
//         },
//         stage: 'WON',
//         createdAt: { gte: start, lte: end }
//       }
//     }),
//     prisma.deal.count({
//       where: { 
//         contact: { 
//           company: { 
//             users: { 
//               some: { 
//                 id: (await getServerSession(authOptions))?.user?.id 
//               } 
//             } 
//           } 
//         },
//         stage: 'LOST',
//         createdAt: { gte: start, lte: end }
//       }
//     }),
//   ]);

//   const deals = await prisma.deal.findMany({
//     where: { 
//       contact: { 
//         company: { 
//           users: { 
//             some: { 
//               id: (await getServerSession(authOptions))?.user?.id 
//             } 
//           } 
//         } 
//       },
//       stage: 'WON',
//       createdAt: { gte: start, lte: end }
//     },
//     select: { amount: true }
//   });

//   const totalRevenue = deals.reduce((sum, deal) => sum + deal.amount, 0);
//   const conversionRate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0;
//   const averageDealValue = wonDeals > 0 ? totalRevenue / wonDeals : 0;

//   // Get top sales reps
//   const topReps = await getTopSalesReps(companyId, start, end);
  
//   // Get stage analysis
//   const stageAnalysis = await getStageAnalysis(companyId, start, end);

//   return {
//     performance: {
//       totalDeals: totalDeals.toString(),
//       wonDeals: wonDeals.toString(),
//       lostDeals: lostDeals.toString(),
//       conversionRate: `${conversionRate.toFixed(1)}%`
//     },
//     revenue: {
//       total: formatCurrency(totalRevenue),
//       recurring: '$0.00', // Placeholder, replace with actual calculation if available
//       new: '$0.00', // Placeholder, replace with actual calculation if available
//       growth: '0%', // Placeholder, replace with actual calculation if available
//       average: wonDeals > 0 ? formatCurrency(averageDealValue) : '$0.00',
//       largest: deals.length > 0 ? formatCurrency(Math.max(...deals.map(d => d.amount))) : '$0.00'
//     },
//     analysis: {
//       wonCount: wonDeals.toString(),
//       lostCount: lostDeals.toString(),
//       wonAvg: wonDeals > 0 ? formatCurrency(averageDealValue) : '$0.00',
//       lostAvg: 'N/A', // Would need additional data
//       wonDuration: 'N/A', // Would need additional data
//       lostDuration: 'N/A' // Would need additional data
//     },
//     topReps,
//     stageAnalysis
//   };
// }

// async function getTopSalesReps(companyId: string, start: Date, end: Date) {
//   // In a real implementation, this would aggregate deals by owner
//   const reps = [
//     { 
//       name: 'John Smith', 
//       dealsWon: '15', 
//       revenue: '$150,000', 
//       conversionRate: '35%' 
//     },
//     { 
//       name: 'Sarah Johnson', 
//       dealsWon: '12', 
//       revenue: '$125,000', 
//       conversionRate: '32%' 
//     },
//     { 
//       name: 'Michael Brown', 
//       dealsWon: '10', 
//       revenue: '$95,000', 
//       conversionRate: '28%' 
//     }
//   ];
  
//   return reps;
// }

// async function getStageAnalysis(companyId: string, start: Date, end: Date) {
//   const stages = ['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'] as const;
  
//   const stageData = await Promise.all(
//     stages.map(async stage => {
//       const deals = await prisma.deal.findMany({
//         where: { 
//           contact: { 
//             company: { 
//               users: { 
//                 some: { 
//                   id: (await getServerSession(authOptions))?.user?.id 
//                 } 
//               } 
//             } 
//           },
//           stage
//         },
//         select: { amount: true }
//       });

//       const totalValue = deals.reduce((sum, deal) => sum + deal.amount, 0);
//       const avgValue = deals.length > 0 ? totalValue / deals.length : 0;
//       const conversionRate = stage === 'WON' ? '100%' : 
//                             stage === 'LOST' ? '0%' : 
//                             'N/A';

//       return {
//         name: stage,
//         count: deals.length,
//         avgValue: formatCurrency(avgValue),
//         conversionRate
//       };
//     })
//   );

//   return stageData;
// }

// async function generatePipelineAnalysisReport(companyId: string): Promise<ReportData> {
//   const stages = ['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'] as const;
  
//   const stageData = await Promise.all(
//     stages.map(async stage => {
//       const deals = await prisma.deal.findMany({
//         where: { 
//           contact: { 
//             company: { 
//               users: { 
//                 some: { 
//                   id: (await getServerSession(authOptions))?.user?.id 
//                 } 
//               } 
//             } 
//           },
//           stage
//         },
//         select: { amount: true }
//       });

//       const totalValue = deals.reduce((sum, deal) => sum + deal.amount, 0);
//       const avgValue = deals.length > 0 ? totalValue / deals.length : 0;

//       return {
//         stage,
//         count: deals.length,
//         totalValue,
//         avgValue
//       };
//     })
//   );

//   // Calculate pipeline health metrics
//   const wonDeals = stageData.find(d => d.stage === 'WON')?.count || 0;
//   const totalDeals = stageData.filter(d => d.stage !== 'WON' && d.stage !== 'LOST').reduce((sum, d) => sum + d.count, 0);
//   const winRate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0;
  
//   // Format data for report
//   const stageDistribution = stageData.map(stage => ({
//     name: stage.stage,
//     count: stage.count.toString(),
//     value: formatCurrency(stage.totalValue),
//     avgValue: formatCurrency(stage.avgValue)
//   }));
  
//   // Deal aging analysis (simplified)
//   const aging = stageData.map(stage => ({
//     name: stage.stage,
//     lessThan7: Math.floor(stage.count * 0.3).toString(),
//     between7And30: Math.floor(stage.count * 0.5).toString(),
//     greaterThan30: Math.floor(stage.count * 0.2).toString()
//   }));

//   return {
//     pipeline: {
//       total: stageData.filter(d => d.stage !== 'WON' && d.stage !== 'LOST').reduce((sum, d) => sum + d.count, 0).toString(),
//       value: formatCurrency(stageData.filter(d => d.stage !== 'WON' && d.stage !== 'LOST').reduce((sum, d) => sum + d.totalValue, 0)),
//       average: stageData.filter(d => d.stage !== 'WON' && d.stage !== 'LOST').length > 0 ? 
//               formatCurrency(stageData.filter(d => d.stage !== 'WON' && d.stage !== 'LOST').reduce((sum, d) => sum + d.totalValue, 0) / 
//               stageData.filter(d => d.stage !== 'WON' && d.stage !== 'LOST').reduce((sum, d) => sum + d.count, 0)) : '$0.00'
//     },
//     health: {
//       winRate: `${winRate.toFixed(1)}%`,
//       velocity: 'N/A', // Would need additional data
//       cycle: 'N/A' // Would need additional data
//     },
//     stageDistribution,
//     aging
//   };
// }

// async function generateContactEngagementReport(companyId: string, start: Date, end: Date): Promise<ReportData> {
//   const contacts = await prisma.contact.findMany({
//     where: { 
//       company: { 
//         users: { 
//           some: { 
//             id: (await getServerSession(authOptions))?.user?.id 
//           } 
//         } 
//       }
//     },
//     include: {
//       logs: {
//         where: { timestamp: { gte: start, lte: end } },
//         orderBy: { timestamp: 'desc' }
//       },
//       deals: true
//     }
//   });

//   const contactReports = await Promise.all(contacts.map(async (contact) => {
//     const logs = await prisma.communicationLog.findMany({
//       where: {
//         contactId: contact.id,
//         timestamp: { gte: start, lte: end }
//       },
//       orderBy: { timestamp: 'desc' }
//     });

//     const deals = await prisma.deal.findMany({
//       where: {
//         contactId: contact.id
//       }
//     });
    
//     const interactionCount = logs.length;
//     const lastInteraction = interactionCount > 0 ? logs[0].timestamp : null;
    
//     // Calculate engagement score
//     let engagementScore = 0;
//     if (interactionCount > 5) engagementScore += 30;
//     else if (interactionCount > 2) engagementScore += 20;
//     else engagementScore += 10;
    
//     if (deals.some(d => d.stage === 'WON')) engagementScore += 40;
//     else if (deals.length > 0) engagementScore += 20;
    
//     if (lastInteraction && new Date(lastInteraction) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
//       engagementScore += 30;
//     }

//     return {
//       id: contact.id,
//       name: contact.fullName,
//       company: contact.companyName || 'N/A',
//       interactions: interactionCount.toString(),
//       lastContact: lastInteraction ? lastInteraction.toISOString() : '',
//       engagement: `${Math.min(engagementScore, 100)}`
//     };
//   }));

//   // Calculate overview
//   const total = contacts.length;
//   const active = contactReports.filter(c => parseInt(c.engagement) >= 50).length;
//   const high = contactReports.filter(c => parseInt(c.engagement) >= 80).length;
//   const medium = contactReports.filter(c => parseInt(c.engagement) >= 50 && parseInt(c.engagement) < 80).length;
  
//   // Engagement score distribution
//   const scoreDistribution = [
//     { range: '80-100', count: high.toString() },
//     { range: '50-79', count: medium.toString() },
//     { range: '0-49', count: (total - active).toString() }
//   ];
  
//   // Top contacts
//   const topContacts = [...contactReports]
//     .sort((a, b) => parseInt(b.engagement) - parseInt(a.engagement))
//     .slice(0, 5);
    
//   // Contact type analysis (simplified)
//   const typeAnalysis = [
//     { 
//       name: 'Customer', 
//       total: '75', 
//       avgEngagement: '65', 
//       conversionRate: '25%' 
//     },
//     { 
//       name: 'Lead', 
//       total: '45', 
//       avgEngagement: '45', 
//       conversionRate: '15%' 
//     },
//     { 
//       name: 'Prospect', 
//       total: '30', 
//       avgEngagement: '35', 
//       conversionRate: '10%' 
//     }
//   ];

//   return {
//     overview: {
//       total: total.toString(),
//       active: active.toString(),
//       high: high.toString(),
//       medium: medium.toString()
//     },
//     metrics2: {
//       avgInteractions: (contactReports.reduce((sum, c) => sum + parseInt(c.interactions), 0) / total).toFixed(1),
//       topType: 'Customer',
//       topChannel: 'Email'
//     },
//     scoreDistribution,
//     topContacts,
//     typeAnalysis
//   };
// }

// async function generateForecastReport(companyId: string): Promise<ReportData> {
//   const [allDeals, wonDeals] = await Promise.all([
//     prisma.deal.findMany({
//       where: { 
//         contact: { 
//           company: { 
//             users: { 
//               some: { 
//                 id: (await getServerSession(authOptions))?.user?.id 
//               } 
//             } 
//           } 
//         }
//       }
//     }),
//     prisma.deal.findMany({
//       where: { 
//         contact: { 
//           company: { 
//             users: { 
//               some: { 
//                 id: (await getServerSession(authOptions))?.user?.id 
//               } 
//             } 
//           } 
//         },
//         stage: 'WON'
//       }
//     })
//   ]);

//   const totalPipeline = allDeals.reduce((sum, deal) => sum + deal.amount, 0);
//   const expectedRevenue = wonDeals.reduce((sum, deal) => sum + deal.amount, 0);
//   const winRate = allDeals.length > 0 ? (wonDeals.length / allDeals.length) * 100 : 0;

//   // Simple forecast
//   const forecast30 = totalPipeline * (winRate / 100) * 0.8;
//   const forecast90 = totalPipeline * (winRate / 100) * 0.6;
//   const expectedRevenue30 = expectedRevenue * 1.1;
//   const expectedRevenue90 = expectedRevenue * 1.3;
//   const forecastWinRate = Math.min(winRate * 1.05, 100);

//   // Stage forecast
//   const stages = ['NEW', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION'] as const;
//   const stageForecast = await Promise.all(stages.map(async stage => {
//     const deals = await prisma.deal.findMany({
//       where: { 
//         contact: { 
//           company: { 
//             users: { 
//               some: { 
//                 id: (await getServerSession(authOptions))?.user?.id 
//               } 
//             } 
//           } 
//         },
//         stage
//       },
//       select: { amount: true }
//     });
    
//     const current = deals.reduce((sum, deal) => sum + deal.amount, 0);
//     const forecast = current * (forecastWinRate / 100);
    
//     return {
//       name: stage,
//       current: formatCurrency(current),
//       forecast: formatCurrency(forecast)
//     };
//   }));
  
//   // Top opportunities
//   const topOpportunities = allDeals
//     .filter(d => d.stage !== 'WON' && d.stage !== 'LOST')
//     .sort((a, b) => b.amount - a.amount)
//     .slice(0, 5)
//     .map(d => ({
//       name: d.title,
//       stage: d.stage,
//       value: formatCurrency(d.amount),
//       closeDate: d.expectedCloseDate ? d.expectedCloseDate.toISOString() : '',
//       probability: d.stage === 'NEGOTIATION' ? '70%' :
//                 d.stage === 'PROPOSAL' ? '50%' :
//                 d.stage === 'QUALIFIED' ? '30%' : '10%'
//     }));
    
//   // Forecast confidence
//   const confidence = [
//     { 
//       name: 'High Confidence (>70%)', 
//       deals: '15', 
//       value: formatCurrency(totalPipeline * 0.3), 
//       winRate: '75%' 
//     },
//     { 
//       name: 'Medium Confidence (40-70%)', 
//       deals: '25', 
//       value: formatCurrency(totalPipeline * 0.5), 
//       winRate: '50%' 
//     },
//     { 
//       name: 'Low Confidence (<40%)', 
//       deals: '10', 
//       value: formatCurrency(totalPipeline * 0.2), 
//       winRate: '25%' 
//     }
//   ];

//   return {
//     forecast: {
//       current: formatCurrency(totalPipeline),
//       thirtyDays: formatCurrency(forecast30),
//       ninetyDays: formatCurrency(forecast90)
//     },
//     metrics1: [
//       {
//         name: 'Win Rate',
//         current: `${winRate.toFixed(1)}%`,
//         threshold: 'N/A', // Add appropriate value
//         status: 'N/A', // Add appropriate value
//       },
//       {
//         name: 'Win Rate (30 Days)',
//         current: `${forecastWinRate.toFixed(1)}%`,
//         threshold: 'N/A',
//         status: 'N/A',
//       },
//       {
//         name: 'Win Rate (90 Days)',
//         current: `${forecastWinRate.toFixed(1)}%`,
//         threshold: 'N/A',
//         status: 'N/A',
//       },
//       {
//         name: 'Revenue',
//         current: formatCurrency(expectedRevenue),
//         threshold: 'N/A',
//         status: 'N/A',
//       },
//       {
//         name: 'Revenue (30 Days)',
//         current: formatCurrency(expectedRevenue30),
//         threshold: 'N/A',
//         status: 'N/A',
//       },
//       {
//         name: 'Revenue (90 Days)',
//         current: formatCurrency(expectedRevenue90),
//         threshold: 'N/A',
//         status: 'N/A',
//       },
//       {
//         name: 'Velocity',
//         current: 'N/A',
//         threshold: 'N/A',
//         status: 'N/A',
//       },
//       {
//         name: 'Velocity (30 Days)',
//         current: 'N/A',
//         threshold: 'N/A',
//         status: 'N/A',
//       },
//       {
//         name: 'Velocity (90 Days)',
//         current: 'N/A',
//         threshold: 'N/A',
//         status: 'N/A',
//       },
//     ],
//     stageForecast,
//     topOpportunities,
//     confidence
//   };
// }

// // Helper functions
// function formatDate(date: Date): string {
//   return date.toISOString().split('T')[0];
// }

// function formatCurrency(amount: number): string {
//   return new Intl.NumberFormat('en-US', {
//     style: 'currency',
//     currency: 'USD'
//   }).format(amount);
// }