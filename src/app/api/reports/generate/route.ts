// // app/api/reports/generate/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import prisma from '@/lib/prisma';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/lib/auth';
// import { Role } from '@/generated/prisma';
// import { z } from 'zod';
// import { generatePDF, ReportType, ReportData, CompanyInfo } from '@/lib/pdf/generateReport';

// // 🔹 Supported report types
// const REPORT_TYPES = [
//   'user-activity',
//   'financial-summary',
//   'inventory-status',
//   'hr-compliance',
//   'security-audit',
//   'system-health',
//   'transaction-summary',
//   'expense-report',
//   'income-report',
//   'sales-performance',
//   'pipeline-analysis',
//   'contact-engagement',
//   'forecast-report'
// ] as const;

// type ReportType = (typeof REPORT_TYPES)[number];

// // 🔹 Date range options
// const DATE_RANGES = ['last7days', 'last30days', 'lastquarter', 'custom'] as const;
// type DateRange = (typeof DATE_RANGES)[number];

// // 🔹 Input validation
// const ReportSchema = z.object({
//   type: z.enum(REPORT_TYPES),
//   dateRange: z.enum(DATE_RANGES).optional(),
//   startDate: z.string().optional(),
//   endDate: z.string().optional(),
// });

// export async function POST(req: NextRequest) {
//   try {
//     // 1. 🔐 Auth & Role Check
//     const session = await getServerSession(authOptions);
//     const user = session?.user;
//     if (!user || !user.currentCompanyId) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const companyId = user.currentCompanyId;

//     // 🔒 Only ADMIN/SUPER_ADMIN can generate reports
//     if (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
//       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
//     }

//     // 2. 📦 Parse Request Body
//     const body = await req.json();
//     const parseResult = ReportSchema.safeParse(body);

//     if (!parseResult.success) {
//       return NextResponse.json(
//         { error: 'Invalid request', details: parseResult.error.errors },
//         { status: 400 }
//       );
//     }

//     const { type, dateRange, startDate, endDate } = parseResult.data;

//     // 3. 📅 Determine Date Range
//     const now = new Date();
//     let start: Date, end: Date;

//     if (dateRange === 'custom') {
//       if (!startDate || !endDate) {
//         return NextResponse.json(
//           { error: 'startDate and endDate required for custom range' },
//           { status: 400 }
//         );
//       }
//       start = new Date(startDate);
//       end = new Date(endDate);
//       if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
//         return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
//       }
//     } else {
//       end = new Date();
//       start = new Date();
//       if (dateRange === 'last7days') start.setDate(end.getDate() - 7);
//       else if (dateRange === 'last30days') start.setDate(end.getDate() - 30);
//       else if (dateRange === 'lastquarter') start.setMonth(end.getMonth() - 3);
//       else start.setDate(end.getDate() - 7); // default
//     }
//     end.setHours(23, 59, 59, 999);

//     // 4. 📊 Get company information for branding
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

//     // 5. 📈 Generate Report Data
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
//       case 'custom':
//         dateRangeLabel = `${formatDate(start)} to ${formatDate(end)}`;
//         break;
//       default:
//         dateRangeLabel = 'Last 30 Days';
//     }

//     // Generate appropriate report data based on type
//     switch (type) {
//       case 'user-activity':
//         reportData = await generateUserActivityReport(companyId, start, end);
//         break;
        
//       case 'financial-summary':
//         reportData = await generateFinancialSummaryReport(companyId, start, end);
//         break;
        
//       case 'transaction-summary':
//       case 'expense-report':
//       case 'income-report':
//         reportData = await generateTransactionReport(type, companyId, start, end);
//         break;
        
//       case 'inventory-status':
//         reportData = await generateInventoryStatusReport(companyId);
//         break;
        
//       case 'hr-compliance':
//         reportData = await generateHRComplianceReport(companyId);
//         break;
        
//       case 'security-audit':
//         reportData = await generateSecurityAuditReport(companyId, start, end);
//         break;
        
//       case 'system-health':
//         reportData = await generateSystemHealthReport(companyId);
//         break;
        
//       case 'sales-performance':
//       case 'pipeline-analysis':
//       case 'contact-engagement':
//       case 'forecast-report':
//         reportData = await generateCRMReport(type, companyId, start, end);
//         break;
        
//       default:
//         return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
//     }

//     // 6. 📄 Generate PDF
//     const pdfBuffer = await generatePDF(type, reportData, dateRangeLabel, companyInfo);

//     // 7. 📥 Return PDF Response
//     const filename = `${type.replace(/-/g, '_')}_report_${formatDate(start)}_to_${formatDate(end)}.pdf`;
    
//     return new NextResponse(pdfBuffer, {
//       status: 200,
//       headers: {
//         'Content-Type': 'application/pdf',
//         'Content-Disposition': `attachment; filename="${filename}"`,
//       },
//     });
//   } catch (error) {
//     console.error('Error generating report:', error);
//     return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
//   }
// }

// // Helper functions for report data generation
// async function generateUserActivityReport(companyId: string, start: Date, end: Date): Promise<ReportData> {
//   const activities = await prisma.auditLog.findMany({
//     where: { companyId, timestamp: { gte: start, lte: end } },
//     orderBy: { timestamp: 'desc' },
//   });

//   // Get unique users
//   const uniqueUsers = new Set();
//   let mostActiveUser = '';
//   const userActivityMap = new Map<string, number>();
  
//   activities.forEach(activity => {
//     if (activity.userId) {
//       uniqueUsers.add(activity.userId);
//       userActivityMap.set(activity.userId, (userActivityMap.get(activity.userId) || 0) + 1);
//     }
//   });
  
//   // Find most active user
//   let maxActivities = 0;
//   for (const [userId, count] of userActivityMap) {
//     if (count > maxActivities) {
//       maxActivities = count;
//       mostActiveUser = userId;
//     }
//   }
  
//   // Get user name for most active user
//   let mostActiveUserName = 'N/A';
//   if (mostActiveUser) {
//     const user = await prisma.user.findUnique({
//       where: { id: mostActiveUser },
//       select: { name: true }
//     });
//     mostActiveUserName = user?.name || 'N/A';
//   }
  
//   // Activity distribution
//   const activityDistribution = activities.reduce((acc, activity) => {
//     const existing = acc.find(item => item.action === activity.action);
//     if (existing) {
//       existing.count++;
//     } else {
//       acc.push({ action: activity.action, count: 1 });
//     }
//     return acc;
//   }, [] as { action: string; count: number }[]);
  
//   // Format activities for report
//   const formattedActivities = await Promise.all(activities.map(async activity => {
//     const user = activity.userId 
//       ? await prisma.user.findUnique({ 
//           where: { id: activity.userId }, 
//           select: { name: true } 
//         }) 
//       : null;
    
//     return {
//       timestamp: activity.timestamp.toISOString(),
//       action: activity.action,
//       user: user?.name || 'System',
//       entity: activity.entity
//     };
//   }));

//   return {
//     summary: {
//       count: activities.length,
//       uniqueUsers: uniqueUsers.size,
//       mostActiveUser: mostActiveUserName
//     },
//     activityDistribution,
//     activities: formattedActivities
//   };
// }

// async function generateFinancialSummaryReport(companyId: string, start: Date, end: Date): Promise<ReportData> {
//   const transactions = await prisma.transaction.findMany({
//     where: {
//       companyId,
//       date: { gte: start, lte: end },
//     },
//     include: { category: true },
//     orderBy: { date: 'asc' },
//   });

//   // Calculate revenue and expenses
//   let totalRevenue = 0;
//   let totalExpenses = 0;
  
//   transactions.forEach(t => {
//     if (t.type === 'INCOME') {
//       totalRevenue += t.amount;
//     } else if (t.type === 'EXPENSE') {
//       totalExpenses += t.amount;
//     }
//   });
  
//   const netProfit = totalRevenue - totalExpenses;
//   const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  
//   // Revenue by category
//   const revenueByCategory = transactions
//     .filter(t => t.type === 'INCOME')
//     .reduce((acc, t) => {
//       const categoryName = t.category?.name || 'Uncategorized';
//       const existing = acc.find(item => item.name === categoryName);
//       if (existing) {
//         existing.amount += t.amount;
//       } else {
//         acc.push({ name: categoryName, amount: t.amount });
//       }
//       return acc;
//     }, [] as { name: string; amount: number }[]);
  
//   // Format revenue by category for report
//   const formattedRevenueByCategory = revenueByCategory.map(category => ({
//     name: category.name,
//     amount: formatCurrency(category.amount),
//     percentage: `${((category.amount / totalRevenue) * 100).toFixed(1)}%`
//   }));
  
//   // Top transactions
//   const topTransactions = transactions
//     .sort((a, b) => b.amount - a.amount)
//     .slice(0, 5)
//     .map(t => ({
//       description: t.description,
//       category: t.category?.name || 'Uncategorized',
//       amount: formatCurrency(t.amount),
//       date: t.date.toISOString()
//     }));
    
//   // Comparison with previous period
//   const prevStart = new Date(start);
//   prevStart.setDate(prevStart.getDate() - (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
//   const prevEnd = new Date(start);
//   prevEnd.setHours(23, 59, 59, 999);
  
//   const prevTransactions = await prisma.transaction.findMany({
//     where: {
//       companyId,
//       date: { gte: prevStart, lte: prevEnd },
//     },
//   });
  
//   let prevRevenue = 0;
//   let prevExpenses = 0;
  
//   prevTransactions.forEach(t => {
//     if (t.type === 'INCOME') {
//       prevRevenue += t.amount;
//     } else if (t.type === 'EXPENSE') {
//       prevExpenses += t.amount;
//     }
//   });
  
//   return {
//     revenue: {
//       total: formatCurrency(totalRevenue),
//       average: totalRevenue > 0 ? formatCurrency(totalRevenue / transactions.filter(t => t.type === 'INCOME').length) : '$0.00'
//     },
//     expenses: {
//       total: formatCurrency(totalExpenses)
//     },
//     profit: {
//       net: formatCurrency(netProfit),
//       margin: `${profitMargin.toFixed(1)}%`
//     },
//     comparison: {
//       revenue: { 
//         current: formatCurrency(totalRevenue), 
//         previous: formatCurrency(prevRevenue) 
//       },
//       expenses: { 
//         current: formatCurrency(totalExpenses), 
//         previous: formatCurrency(prevExpenses) 
//       },
//       profit: { 
//         current: formatCurrency(netProfit), 
//         previous: formatCurrency(prevRevenue - prevExpenses) 
//       }
//     },
//     revenueByCategory: formattedRevenueByCategory,
//     topTransactions
//   };
// }

// async function generateTransactionReport(
//   reportType: ReportType, 
//   companyId: string, 
//   start: Date, 
//   end: Date
// ): Promise<ReportData> {
//   const isExpense = reportType === 'expense-report';
//   const isIncome = reportType === 'income-report';
  
//   const transactions = await prisma.transaction.findMany({
//     where: { 
//       companyId,
//       date: { gte: start, lte: end },
//       ...(isExpense ? { type: 'EXPENSE' } : isIncome ? { type: 'INCOME' } : {})
//     },
//     include: { category: true },
//   });
  
//   // Calculate summary
//   const total = transactions.reduce((sum, t) => sum + t.amount, 0);
//   const count = transactions.length;
//   const average = count > 0 ? total / count : 0;
  
//   // Group by category
//   const categoryMap = new Map<string, { amount: number; count: number }>();
//   transactions.forEach(t => {
//     const categoryName = t.category?.name || 'Uncategorized';
//     const existing = categoryMap.get(categoryName) || { amount: 0, count: 0 };
//     categoryMap.set(categoryName, {
//       amount: existing.amount + t.amount,
//       count: existing.count + 1
//     });
//   });
  
//   // Convert to array and calculate percentages
//   const summaryByCategory = Array.from(categoryMap, ([name, { amount, count }]) => ({
//     name,
//     amount: formatCurrency(amount),
//     percentage: `${((amount / total) * 100).toFixed(1)}%`
//   }));
  
//   // Format transactions for report
//   const formattedTransactions = transactions.map(t => ({
//     description: t.description,
//     category: t.category?.name || 'Uncategorized',
//     amount: formatCurrency(t.amount),
//     date: t.date.toISOString(),
//     status: t.status
//   }));
  
//   return {
//     summary: {
//       total: formatCurrency(total),
//       average: formatCurrency(average),
//       count
//     },
//     period: {
//       start: formatDateString(start),
//       end: formatDateString(end)
//     },
//     transactions: formattedTransactions,
//     summaryByCategory
//   };
// }

// async function generateInventoryStatusReport(companyId: string): Promise<ReportData> {
//   const products = await prisma.product.findMany({
//     where: { companyId },
//     include: { category: true },
//   });
  
//   // Calculate summary
//   const totalItems = products.length;
//   const inStock = products.filter(p => p.quantity > 0).length;
//   const lowStock = products.filter(p => p.quantity <= (p.threshold || 10)).length;
//   const outOfStock = products.filter(p => p.quantity === 0).length;
  
//   // Calculate total value
//   const totalValue = products.reduce((sum, p) => sum + (p.unitPrice * p.quantity), 0);
//   const averageValue = inStock > 0 ? totalValue / inStock : 0;
//   const highValueCount = products.filter(p => p.unitPrice * p.quantity > 1000).length;
  
//   // Low stock items
//   const lowStockItems = products
//     .filter(p => p.quantity <= (p.threshold || 10))
//     .map(p => ({
//       sku: p.sku,
//       name: p.name,
//       quantity: p.quantity.toString(),
//       threshold: (p.threshold || 10).toString()
//     }));
    
//   // Inventory by category
//   const byCategory = products.reduce((acc, p) => {
//     const categoryName = p.category?.name || 'Uncategorized';
//     const existing = acc.find(item => item.name === categoryName);
    
//     if (existing) {
//       existing.itemCount++;
//       existing.value += p.unitPrice * p.quantity;
//       if (p.quantity <= (p.threshold || 10)) {
//         existing.lowStockCount++;
//       }
//     } else {
//       acc.push({
//         name: categoryName,
//         itemCount: 1,
//         value: p.unitPrice * p.quantity,
//         lowStockCount: p.quantity <= (p.threshold || 10) ? 1 : 0
//       });
//     }
    
//     return acc;
//   }, [] as Array<{ name: string; itemCount: number; value: number; lowStockCount: number }>);
  
//   // Format by category for report
//   const formattedByCategory = byCategory.map(category => ({
//     name: category.name,
//     itemCount: category.itemCount.toString(),
//     value: formatCurrency(category.value),
//     lowStockCount: category.lowStockCount.toString()
//   }));

//   return {
//     summary: {
//       totalItems: totalItems.toString(),
//       inStock: inStock.toString(),
//       lowStock: lowStock.toString(),
//       outOfStock: outOfStock.toString()
//     },
//     value: {
//       total: formatCurrency(totalValue),
//       average: formatCurrency(averageValue),
//       highValueCount: highValueCount.toString()
//     },
//     lowStockItems,
//     byCategory: formattedByCategory
//   };
// }

// async function generateHRComplianceReport(companyId: string): Promise<ReportData> {
//   const employees = await prisma.employee.findMany({
//     where: { companyId },
//     include: { 
//       user: { select: { role: true } }, 
//       department: true,
//       performanceReviews: true
//     },
//   });
  
//   // Calculate summary
//   const total = employees.length;
//   const active = employees.filter(e => e.status === 'ACTIVE').length;
//   const onLeave = employees.filter(e => e.status === 'ON_LEAVE').length;
//   const terminated = employees.filter(e => e.status === 'TERMINATED').length;
  
//   // Department distribution
//   const departmentDistribution = employees.reduce((acc, e) => {
//     const deptName = e.department?.name || 'Uncategorized';
//     const existing = acc.find(item => item.name === deptName);
//     if (existing) {
//       existing.count++;
//     } else {
//       acc.push({ name: deptName, count: 1 });
//     }
//     return acc;
//   }, [] as { name: string; count: number }[]);
  
//   // Format employees for report
//   const formattedEmployees = employees.map(e => ({
//     name: `${e.firstName} ${e.lastName}`,
//     role: e.user?.role || 'EMPLOYEE',
//     department: e.department?.name || 'N/A',
//     hireDate: e.hireDate ? e.hireDate.toISOString() : '',
//     status: e.status
//   }));
  
//   // Compliance status
//   const compliance = [
//     {
//       area: 'I-9 Verification',
//       status: 'COMPLIANT',
//       nextReview: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
//     },
//     {
//       area: 'W-4 Form',
//       status: 'COMPLIANT',
//       nextReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
//     },
//     {
//       area: 'Background Check',
//       status: employees.some(e => !e.backgroundCheckCompleted) ? 'NON-COMPLIANT' : 'COMPLIANT',
//       nextReview: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
//     },
//     {
//       area: 'Training Completion',
//       status: 'COMPLIANT',
//       nextReview: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
//     }
//   ];

//   return {
//     summary: {
//       total: total.toString(),
//       active: active.toString(),
//       onLeave: onLeave.toString(),
//       terminated: terminated.toString()
//     },
//     departmentDistribution,
//     employees: formattedEmployees,
//     compliance
//   };
// }

// async function generateSecurityAuditReport(companyId: string, start: Date, end: Date): Promise<ReportData> {
//   const logs = await prisma.auditLog.findMany({
//     where: {
//       companyId,
//       action: { in: ['CREATE','UPDATE', 'DELETE', 'LOGIN_FAILED', 'PASSWORD_RESET', 'PERMISSION_DENIED', 'DATA_EXPORT'] },
//       timestamp: { gte: start, lte: end },
//     },
//     orderBy: { timestamp: 'desc' },
//   });
  
//   // Calculate summary
//   const total = logs.length;
//   const critical = logs.filter(l => l.severity === 'CRITICAL').length;
//   const high = logs.filter(l => l.severity === 'HIGH').length;
//   const medium = logs.filter(l => l.severity === 'MEDIUM').length;
  
//   // User activity
//   const userActivity = logs.reduce((acc, log) => {
//     const userId = log.userId || 'system';
//     const existing = acc.find(item => item.name === userId);
//     if (existing) {
//       existing.count++;
//     } else {
//       acc.push({ name: userId, count: 1 });
//     }
//     return acc;
//   }, [] as { name: string; count: number }[]);
  
//   // Format critical events
//   const criticalEvents = logs
//     .filter(l => l.severity === 'CRITICAL')
//     .map(l => ({
//       timestamp: l.timestamp.toISOString(),
//       action: l.action,
//       user: l.userId ? getUserIdToName(l.userId) : 'System',
//       ip: l.ip || 'N/A',
//       severity: l.severity
//     }));
    
//   // Top events
//   const topEvents = logs.reduce((acc, log) => {
//     const existing = acc.find(item => item.action === log.action);
//     if (existing) {
//       existing.count++;
//     } else {
//       acc.push({ action: log.action, count: 1 });
//     }
//     return acc;
//   }, [] as { action: string; count: number }[])
//   .sort((a, b) => b.count - a.count)
//   .slice(0, 5);

//   return {
//     summary: {
//       total: total.toString(),
//       critical: critical.toString(),
//       high: high.toString(),
//       medium: medium.toString()
//     },
//     userActivity,
//     criticalEvents,
//     topEvents
//   };
// }

// async function generateSystemHealthReport(companyId: string): Promise<ReportData> {
//   // Get system metrics (in a real implementation, these would come from monitoring tools)
//   const userCount = await prisma.user.count({ where: { companyId } });
//   const productCount = await prisma.product.count({ where: { companyId } });
//   const transactionCount = await prisma.transaction.count({
//     where: { companyId }
//   });
//   const lowStockCount = await prisma.product.count({
//     where: { companyId, quantity: { lte: 10 } },
//   });
  
//   const now = new Date();
  
//   return {
//     system: {
//       uptime: '99.95%',
//       load: '0.75',
//       memory: '65%',
//       storage: '45%'
//     },
//     services: [
//       { name: 'Database', status: 'OPERATIONAL' },
//       { name: 'API Server', status: 'OPERATIONAL' },
//       { name: 'Authentication', status: 'OPERATIONAL' },
//       { name: 'Reporting', status: 'OPERATIONAL' }
//     ],
//     metrics: [
//       { name: 'API Response Time', current: '120ms', threshold: '500ms', status: 'NORMAL' },
//       { name: 'Error Rate', current: '0.5%', threshold: '1%', status: 'NORMAL' },
//       { name: 'Throughput', current: '120 req/s', threshold: '200 req/s', status: 'NORMAL' }
//     ],
//     database: {
//       connections: {
//         current: 45,
//         max: 100
//       },
//       queries: [
//         { type: 'SELECT', avgTime: '45ms' },
//         { type: 'INSERT', avgTime: '25ms' },
//         { type: 'UPDATE', avgTime: '35ms' },
//         { type: 'DELETE', avgTime: '20ms' }
//       ]
//     },
//     alerts: [
//       { 
//         timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), 
//         message: 'High API response time detected', 
//         severity: 'MEDIUM' 
//       },
//       { 
//         timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(), 
//         message: 'Database connection pool almost full', 
//         severity: 'HIGH' 
//       }
//     ]
//   };
// }

// async function generateCRMReport(
//   reportType: ReportType, 
//   companyId: string, 
//   start: Date, 
//   end: Date
// ): Promise<ReportData> {
//   switch (reportType) {
//     case 'sales-performance':
//       return generateSalesPerformanceReport(companyId, start, end);
      
//     case 'pipeline-analysis':
//       return generatePipelineAnalysisReport(companyId);
      
//     case 'contact-engagement':
//       return generateContactEngagementReport(companyId, start, end);
      
//     case 'forecast-report':
//       return generateForecastReport(companyId);
      
//     default:
//       throw new Error('Invalid CRM report type');
//   }
// }

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
//     metrics: {
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
//     metrics: {
//       winRate: `${winRate.toFixed(1)}%`,
//       winRate30: `${forecastWinRate.toFixed(1)}%`,
//       winRate90: `${forecastWinRate.toFixed(1)}%`,
//       revenue: formatCurrency(expectedRevenue),
//       revenue30: formatCurrency(expectedRevenue30),
//       revenue90: formatCurrency(expectedRevenue90),
//       velocity: 'N/A', // Would need additional data
//       velocity30: 'N/A',
//       velocity90: 'N/A'
//     },
//     stageForecast,
//     topOpportunities,
//     confidence
//   };
// }

// // Helper functions
// function getUserIdToName(userId: string): string {
//   // In a real implementation, this would fetch the user name
//   return `User ${userId.substring(0, 8)}`;
// }

// function formatDate(date: Date): string {
//   return date.toISOString().split('T')[0];
// }

// function formatDateString(date: Date): string {
//   return new Date(date).toLocaleDateString('en-US', {
//     year: 'numeric',
//     month: 'short',
//     day: 'numeric'
//   });
// }

// function formatCurrency(amount: number): string {
//   return new Intl.NumberFormat('en-US', {
//     style: 'currency',
//     currency: 'USD'
//   }).format(amount);
// }