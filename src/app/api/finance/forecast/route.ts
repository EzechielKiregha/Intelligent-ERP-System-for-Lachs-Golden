import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const companyId = session.user.companyId;

  try {
    // Determine past 6 months
    const now = new Date();
    const results: Array<{ month: string; revenue: number; expenses: number }> = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);

      // Fetch transactions for the month
      const transactions = await prisma.transaction.findMany({
        where: {
          companyId,
          date: { gte: start, lt: end },
        },
        select: {
          amount: true,
          category: { select: { type: true } },
        },
      });

      // Calculate revenue and expenses manually
      const revenue = transactions
        .filter((tx) => tx.category.type === 'INCOME')
        .reduce((sum, tx) => sum + tx.amount, 0);

      const expenses = transactions
        .filter((tx) => tx.category.type === 'EXPENSE')
        .reduce((sum, tx) => sum + tx.amount, 0);

      results.push({
        month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        revenue,
        expenses,
      });
    }

    // Simple projection: average change over past months
    const revChanges: number[] = [];
    const expChanges: number[] = [];
    for (let i = 1; i < results.length; i++) {
      revChanges.push(results[i].revenue - results[i - 1].revenue);
      expChanges.push(results[i].expenses - results[i - 1].expenses);
    }

    const avgRevChange = revChanges.length ? revChanges.reduce((a, b) => a + b, 0) / revChanges.length : 0;
    const avgExpChange = expChanges.length ? expChanges.reduce((a, b) => a + b, 0) / expChanges.length : 0;

    // Project next 3 months
    const forecast: Array<{ month: string; projectedRevenue: number; projectedExpenses: number }> = [];
    const last = results[results.length - 1];
    let lastDateParts = last.month.split('-').map(Number);
    let lastRev = last.revenue;
    let lastExp = last.expenses;

    for (let j = 1; j <= 3; j++) {
      let year = lastDateParts[0];
      let month = lastDateParts[1] + j;
      // Handle year rollover
      year += Math.floor((month - 1) / 12);
      month = ((month - 1) % 12) + 1;
      const projMonth = `${year}-${String(month).padStart(2, '0')}`;
      lastRev = lastRev + avgRevChange;
      lastExp = lastExp + avgExpChange;
      forecast.push({
        month: projMonth,
        projectedRevenue: Math.max(0, lastRev),
        projectedExpenses: Math.max(0, lastExp),
      });
    }

    return NextResponse.json({ past: results, forecast });
  } catch (error) {
    console.error('Error in forecast route:', error);
    return NextResponse.json({ error: 'Failed to compute forecast' }, { status: 500 });
  }
}