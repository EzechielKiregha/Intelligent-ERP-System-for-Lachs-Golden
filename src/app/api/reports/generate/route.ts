import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Role } from '@/generated/prisma';
import { z } from 'zod';

// 🔹 Supported report types
const REPORT_TYPES = [
  'user-activity',
  'financial-summary',
  'inventory-status',
  'hr-compliance',
  'security-audit',
  'system-health',
] as const;

type ReportType = (typeof REPORT_TYPES)[number];

// 🔹 Date range options
const DATE_RANGES = ['last7days', 'last30days', 'lastquarter', 'custom'] as const;
type DateRange = (typeof DATE_RANGES)[number];

// 🔹 Input validation
const ReportSchema = z.object({
  type: z.enum(REPORT_TYPES),
  dateRange: z.enum(DATE_RANGES).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. 🔐 Auth & Role Check
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user || !user.currentCompanyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = user.currentCompanyId;

    // 🔒 Only ADMIN/SUPER_ADMIN can generate reports
    if (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. 📦 Parse Request Body
    const body = await req.json();
    const parseResult = ReportSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const { type, dateRange, startDate, endDate } = parseResult.data;

    // 3. 📅 Determine Date Range
    const now = new Date();
    let start: Date, end: Date;

    if (dateRange === 'custom') {
      if (!startDate || !endDate) {
        return NextResponse.json(
          { error: 'startDate and endDate required for custom range' },
          { status: 400 }
        );
      }
      start = new Date(startDate);
      end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
        return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
      }
    } else {
      end = new Date();
      start = new Date();
      if (dateRange === 'last7days') start.setDate(end.getDate() - 7);
      else if (dateRange === 'last30days') start.setDate(end.getDate() - 30);
      else if (dateRange === 'lastquarter') start.setMonth(end.getMonth() - 3);
      else start.setDate(end.getDate() - 7); // default
    }
    end.setHours(23, 59, 59, 999);

    // 4. 📊 Fetch Data by Report Type
    let headers: string[] = [];
    let rows: Promise<string[]> | string[] = [];
    let filename: string;

    switch (type) {
      // 📈 User Activity Report (CSV)
      case 'user-activity': {
        const activities = await prisma.auditLog.findMany({
          where: { companyId, timestamp: { gte: start, lte: end } },
          orderBy: { timestamp: 'desc' },
        });

        headers = ['Timestamp', 'Action', 'Entity', 'Entity ID', 'User Name', 'User Email', 'Details'];
        rows = Promise.all(activities.map(async (a) => {
          const timestamp = new Date(a.timestamp).toISOString();
          const u = await prisma.user.findUnique({
            where: { id: a.userId || '' },
            select: { name: true , email: true },
          });
          const user = u ? `"${u.name || ''}"` : 'System';
          const email = u?.email ? `"${u.email}"` : '';
          const details = a.description ? `"${a.description.replace(/"/g, '""')}"` : '';
          return [timestamp, a.action, a.entity, a.entityId || '', user, email, details].join(',');
        })
      );

        filename = `user-activity_${formatDate(start)}_to_${formatDate(end)}.csv`;
        break;
      }

      // 💰 Financial Summary (CSV)
      case 'financial-summary': {
        const transactions = await prisma.transaction.findMany({
          where: {
            companyId,
            date: { gte: start, lte: end },
          },
          include: { category: true, user: { select: { name: true, email: true } } },
          orderBy: { date: 'asc' },
        });

        headers = ['ID', 'Date', 'Description', 'Category', 'Type', 'Amount', 'Status', 'User'];
        rows = Promise.all(transactions.map(async (t) => {
          const date = new Date(t.date).toISOString();
          const desc = t.description ? `"${t.description.replace(/"/g, '""')}"` : '""';
          const u = await prisma.user.findUnique({
            where: { id: t.userId || '' },
            select: { name: true },
          });
          const c = await prisma.category.findUnique({
            where: { id: t.categoryId || '' },
            select: { name: true, type: true },
          });
          const user = u ? `"${u.name}"` : '""';
          return [
            t.id,
            date,
            desc,
            c?.name,
            c?.type,
            t.amount.toString(),
            t.status,
            user,
          ].join(',');
        }));

        filename = `financial-summary_${formatDate(start)}_to_${formatDate(end)}.csv`;
        break;
      }

      // 📦 Inventory Status (CSV)
      case 'inventory-status': {
        const products = await prisma.product.findMany({
          where: { companyId },
          orderBy: { quantity: 'asc' },
        });

        headers = ['SKU', 'Name', 'Quantity', 'Threshold', 'Price', 'Category', 'Status'];
        rows = products.map((p) => {
          const threshold = p.threshold || 10; // default threshold
          const status = p.quantity <= threshold ? 'LOW' : 'OK';
          return [
            p.sku,
            `"${p.name.replace(/"/g, '""')}"`,
            p.quantity.toString(),
            threshold.toString(),
            p.unitPrice.toString(),
            status,
          ].join(',');
        });

        filename = `inventory-status_${formatDate(start)}_to_${formatDate(end)}.csv`;
        break;
      }

      // 🧑‍💼 HR Compliance (CSV)
      case 'hr-compliance': {
        const employees = await prisma.employee.findMany({
          where: { companyId },
          include: { user: { select: { role: true } }, department: true },
        });

        headers = ['ID', 'Name', 'Email', 'Job Title', 'Department', 'Hire Date', 'Role', 'Status'];
        rows = employees.map((e) => {
          const name = `"${e.firstName} ${e.lastName}"`;
          const hireDate = e.hireDate ? new Date(e.hireDate).toISOString() : '';
          return [
            e.id,
            name,
            e.email,
            e.jobTitle || 'N/A',
            e.department?.name || 'N/A',
            hireDate,
            e.user?.role || 'EMPLOYEE',
            e.status,
          ].join(',');
        });

        filename = `hr-compliance_${formatDate(start)}_to_${formatDate(end)}.csv`;
        break;
      }

      // 🔐 Security Audit (CSV)
      case 'security-audit': {
        const logs = await prisma.auditLog.findMany({
          where: {
            companyId,
            action: { in: ['CREATE','UPDATE', 'DELETE' ,'LOGIN_FAILED', 'PASSWORD_RESET', 'PERMISSION_DENIED', 'DATA_EXPORT'] },
            timestamp: { gte: start, lte: end },
          },
          orderBy: { timestamp: 'desc' },
        });

        headers = ['Timestamp', 'Action', 'User ID', 'IP', 'Details'];
        rows = logs.map((l) => {
          const timestamp = new Date(l.timestamp).toISOString();
          const details = l.description ? `"${l.description.replace(/"/g, '""')}"` : '';
          return [timestamp, l.action, l.userId || 'N/A', details].join(',');
        });

        filename = `security-audit_${formatDate(start)}_to_${formatDate(end)}.csv`;
        break;
      }

      // 🏥 System Health (CSV)
      case 'system-health': {
        const userCount = await prisma.user.count({ where: { companyId } });
        const productCount = await prisma.product.count({ where: { companyId } });
        const transactionCount = await prisma.transaction.count({
          where: { companyId, date: { gte: start, lte: end } },
        });
        const lowStockCount = await prisma.product.count({
          where: { companyId, quantity: { lte: 10 } },
        });

        headers = ['Metric', 'Value', 'Timestamp'];
        rows = [
          `Total Users,${userCount},${now.toISOString()}`,
          `Total Products,${productCount},${now.toISOString()}`,
          `Transactions (Period),${transactionCount},${now.toISOString()}`,
          `Low Stock Items,${lowStockCount},${now.toISOString()}`,
        ];

        filename = `system-health_${formatDate(start)}_to_${formatDate(end)}.csv`;
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    // 5. 📄 Build CSV
    const resolvedRows = await Promise.resolve(rows);
    const csvContent = [headers.join(','), ...resolvedRows].join('\r\n');

    // 6. 📥 Return CSV Response
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

// 🔹 Helper: Format date for filename
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}