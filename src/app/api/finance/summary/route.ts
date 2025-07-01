import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Define query schema
const QuerySchema = z.object({
  period: z.enum(['month', 'week', 'year']).optional(),
  startDate: z.string().optional().refine((s) => !s || !isNaN(Date.parse(s)), { message: 'Invalid date' }),
  endDate: z.string().optional().refine((s) => !s || !isNaN(Date.parse(s)), { message: 'Invalid date' }),
});

export async function GET(req: NextRequest) {
  // 1. Authentication
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const companyId = session.user.companyId;

  // 2. Parse query parameters
  const url = new URL(req.url);
  const parseResult = QuerySchema.safeParse({
    period: url.searchParams.get('period') || undefined,
    startDate: url.searchParams.get('startDate') || undefined,
    endDate: url.searchParams.get('endDate') || undefined,
  });

  if (!parseResult.success) {
    return NextResponse.json({ error: 'Invalid query parameters', details: parseResult.error.errors }, { status: 400 });
  }

  const { period, startDate, endDate } = parseResult.data;

  // 3. Determine date ranges
  const now = new Date();
  let currStart: Date, currEnd: Date, prevStart: Date, prevEnd: Date;

  if (startDate && endDate) {
    // Custom range
    currStart = new Date(startDate);
    currEnd = new Date(endDate);
    currEnd.setHours(23, 59, 59, 999);
    const diff = currEnd.getTime() - currStart.getTime();
    prevEnd = new Date(currStart.getTime() - 1);
    prevStart = new Date(prevEnd.getTime() - diff);
  } else if (period === 'week') {
    // Last 7 days vs previous 7 days
    currEnd = new Date();
    currStart = new Date();
    currStart.setDate(currEnd.getDate() - 7);
    prevEnd = new Date(currStart.getTime() - 1);
    prevStart = new Date(prevEnd.getTime() - 7);
  } else if (period === 'year') {
    // Year-to-date vs previous year-to-date
    currStart = new Date(now.getFullYear(), 0, 1);
    currEnd = new Date();
    prevStart = new Date(now.getFullYear() - 1, 0, 1);
    prevEnd = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else {
    // Default to month-to-date vs previous month-to-date
    currStart = new Date(now.getFullYear(), now.getMonth(), 1);
    currEnd = new Date();
    const prevMonth = now.getMonth() - 1;
    const prevYear = prevMonth < 0 ? now.getFullYear() - 1 : now.getFullYear();
    const prevMonthIndex = (prevMonth + 12) % 12;
    prevStart = new Date(prevYear, prevMonthIndex, 1);
    const day = now.getDate();
    const daysInPrevMonth = new Date(prevYear, prevMonthIndex + 1, 0).getDate();
    const endDay = Math.min(day, daysInPrevMonth);
    prevEnd = new Date(prevYear, prevMonthIndex, endDay, 23, 59, 59, 999);
  }

  // 4. Helper function to calculate sums manually
  async function calculateSum(type: 'INCOME' | 'EXPENSE', start: Date, end: Date) {
    const transactions = await prisma.transaction.findMany({
      where: {
        // companyId,
        category: { type },
        date: { gte: start, lte: end },
      },
      select: { amount: true },
    });

    // Manually sum the amounts
    return transactions.reduce((sum, tx) => sum + tx.amount, 0);
  }

  try {
    // 5. Calculate current and previous sums
    const [currRevenue, currExpenses, prevRevenue, prevExpenses] = await Promise.all([
      calculateSum('INCOME', currStart, currEnd),
      calculateSum('EXPENSE', currStart, currEnd),
      calculateSum('INCOME', prevStart, prevEnd),
      calculateSum('EXPENSE', prevStart, prevEnd),
    ]);

    const currNetProfit = currRevenue - currExpenses;
    const prevNetProfit = prevRevenue - prevExpenses;

    // 6. Return response
    return NextResponse.json({
      totalRevenue: currRevenue,
      prevRevenue,
      totalExpenses: currExpenses,
      prevExpenses,
      netProfit: currNetProfit,
      prevNetProfit,
      period: period || (startDate && endDate ? 'custom' : 'month'),
      ranges: {
        currStart: currStart.toISOString(),
        currEnd: currEnd.toISOString(),
        prevStart: prevStart.toISOString(),
        prevEnd: prevEnd.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error calculating financial summary:', error);
    return NextResponse.json({ error: 'Failed to calculate financial summary' }, { status: 500 });
  }
}