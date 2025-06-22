// app/api/finance/forecast/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
    if (!session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const companyId = session.user.companyId
  try {
    // Determine past 6 months
    const now = new Date();
    const results: Array<{ month: string; revenue: number; expenses: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      // sum revenue
      const revAgg = await prisma.transaction.aggregate({
        where: {
          companyId,
          category: { type: 'INCOME' },
          date: { gte: start, lt: end },
        },
        _sum: { amount: true },
      });
      // sum expenses
      const expAgg = await prisma.transaction.aggregate({
        where: {
          companyId,
          category: { type: 'EXPENSE' },
          date: { gte: start, lt: end },
        },
        _sum: { amount: true },
      });
      results.push({
        month: `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`,
        revenue: revAgg._sum.amount ?? 0,
        expenses: expAgg._sum.amount ?? 0,
      });
    }
    // Simple projection: average change over past months
    let revChanges: number[] = [];
    let expChanges: number[] = [];
    for (let i = 1; i < results.length; i++) {
      revChanges.push(results[i].revenue - results[i-1].revenue);
      expChanges.push(results[i].expenses - results[i-1].expenses);
    }
    const avgRevChange = revChanges.length ? revChanges.reduce((a,b)=>a+b,0)/revChanges.length : 0;
    const avgExpChange = expChanges.length ? expChanges.reduce((a,b)=>a+b,0)/expChanges.length : 0;
    // Project next 3 months
    const forecast: Array<{ month: string; projectedRevenue: number; projectedExpenses: number }> = [];
    const last = results[results.length-1];
    let lastDateParts = last.month.split('-').map(Number);
    let lastRev = last.revenue;
    let lastExp = last.expenses;
    for (let j = 1; j <= 3; j++) {
      let year = lastDateParts[0];
      let month = lastDateParts[1] + j;
      // handle year rollover
      year += Math.floor((month-1)/12);
      month = ((month-1)%12)+1;
      const projMonth = `${year}-${String(month).padStart(2,'0')}`;
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
