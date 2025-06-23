import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { z } from 'zod';
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth';


// Define allowed report types and dateRange options
const QuerySchema = z.object({
  type: z.enum(['revenue', 'expenses', 'transactions']), // extend if needed
  dateRange: z.enum(['last7days', 'last30days', 'lastquarter', 'custom']).optional(),
  startDate: z.string().optional(), // ISO yyyy-MM-dd or full ISO string
  endDate: z.string().optional(),
});

export async function GET(req: NextRequest) {
  // 1. Auth check
  const { searchParams } = new URL(req.url);
  // Retrieve session server-side
  const session = await getServerSession(authOptions)
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const companyId = session.user.companyId
  // 2. Parse and validate query params
  
  const parseResult = QuerySchema.safeParse({
    type: searchParams.get('type'),
    dateRange: searchParams.get('dateRange') || undefined,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
  });
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Invalid query', details: parseResult.error.errors },
      { status: 400 }
    );
  }
  const { type, dateRange, startDate, endDate } = parseResult.data;

  // 3. Determine date range
  const now = new Date();
  let start: Date;
  let end: Date;
  if (dateRange && dateRange !== 'custom') {
    if (dateRange === 'last7days') {
      end = new Date();
      start = new Date();
      start.setDate(end.getDate() - 7);
    } else if (dateRange === 'last30days') {
      end = new Date();
      start = new Date();
      start.setDate(end.getDate() - 30);
    } else if (dateRange === 'lastquarter') {
      end = new Date();
      start = new Date();
      start.setMonth(end.getMonth() - 3);
    } else {
      // fallback
      end = new Date();
      start = new Date();
      start.setDate(end.getDate() - 7);
    }
  } else if (dateRange === 'custom') {
    // require both startDate and endDate
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate required for custom range' },
        { status: 400 }
      );
    }
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s.valueOf()) || isNaN(e.valueOf()) || s > e) {
      return NextResponse.json(
        { error: 'Invalid startDate or endDate' },
        { status: 400 }
      );
    }
    start = s;
    end = e;
  } else {
    // default to last7days
    end = new Date();
    start = new Date();
    start.setDate(end.getDate() - 7);
  }
  // Normalize end to end of day
  end.setHours(23, 59, 59, 999);

  // 4. Fetch data based on type
  let transactions: any[] = [];
  try {
    if (type === 'transactions') {
      // full transaction details
      transactions = await prisma.transaction.findMany({
        where: {
          companyId,
          date: {
            gte: start,
            lte: end,
          },
        },
        include: {
          category: true,
          user: { select: { name: true, email: true } },
        },
        orderBy: { date: 'asc' },
      });
    }  else if (type === 'revenue' || type === 'expenses') {
      // Fetch all transactions for the given type and manually group by date
      const isIncome = type === 'revenue';
      const rawTransactions = await prisma.transaction.findMany({
        where: {
          companyId,
          category: { type: isIncome ? 'INCOME' : 'EXPENSE' },
          date: { gte: start, lte: end },
        },
        select: {
          date: true,
          amount: true,
        },
        orderBy: { date: 'asc' },
      });

      // Group transactions by date
      const grouped = rawTransactions.reduce((acc, tx) => {
        const dateKey = tx.date.toISOString().split('T')[0]; // Group by date only (YYYY-MM-DD)
        if (!acc[dateKey]) {
          acc[dateKey] = 0;
        }
        acc[dateKey] += tx.amount;
        return acc;
      }, {} as Record<string, number>);

      // Convert grouped data into an array
      transactions = Object.entries(grouped).map(([date, amount]) => ({
        date: new Date(date),
        amount,
      }));
    } else {
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }
  } catch (e) {
    console.error('Error fetching report data:', e);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }

  // 5. Build CSV content in memory
  let headers: string[];
  let rows: string[] = [];
  if (type === 'transactions') {
    headers = [
      'ID',
      'Date',
      'Description',
      'Category',
      'Category Type',
      'Amount',
      'Status',
      'User Name',
      'User Email',
    ];
    rows = (transactions as any[]).map(tx => {
      const id = tx.id;
      const dateStr = tx.date.toISOString();
      const desc = tx.description ? tx.description.replace(/"/g, '""') : '';
      const catName = tx.category.name;
      const catType = tx.category.type;
      const amt = tx.amount.toString();
      const status = tx.status;
      const uname = tx.user?.name ?? '';
      const uemail = tx.user?.email ?? '';
      // wrap description in quotes
      return [
        id,
        dateStr,
        `"${desc}"`,
        catName,
        catType,
        amt,
        status,
        `"${uname}"`,
        `"${uemail}"`,
      ].join(',');
    });
  } else {
    // revenue or expenses: group-by date summary
    headers = ['Date', 'Amount'];
    rows = (transactions as any[]).map(entry => {
      const dateStr = entry.date.toISOString();
      const amt = entry.amount.toString();
      return [dateStr, amt].join(',');
    });
  }
  const csvLines = [headers.join(','), ...rows];
  const csvContent = csvLines.join('\r\n');

  // 6. Prepare filename
  const startFmt = start.toISOString().slice(0, 10);
  const endFmt = end.toISOString().slice(0, 10);
  const filename = `report_${type}_${startFmt}_to_${endFmt}.csv`;

  // 7. Return CSV response
  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
