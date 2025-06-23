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
    const now = new Date();

    // 1. Budget Usage Insights
    const categories = await prisma.category.findMany({
      where: { companyId },
      select: { id: true, name: true, budgetLimit: true, budgetUsed: true },
    });

    const budgetInsights = categories
      .filter((cat) => cat.budgetLimit !== null && cat.budgetLimit > 0)
      .map((cat) => {
        const pct = (Number(cat.budgetUsed) / Number(cat.budgetLimit)) * 100;
        if (pct >= 100) {
          return `Category "${cat.name}" has exceeded its budget.`;
        } else if (pct >= 80) {
          return `Category "${cat.name}" is at ${pct.toFixed(0)}% of its budget.`;
        }
        return null;
      })
      .filter(Boolean);

    // 2. Unusual Spending Insights
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

    const expenseData = await prisma.transaction.findMany({
      where: {
        companyId,
        category: { type: 'EXPENSE' },
        date: { gte: lastMonthStart },
      },
      select: {
        categoryId: true,
        date: true,
        amount: true,
      },
    });

    const spendingInsights = categories.map((cat) => {
      const lastMonthExpenses = expenseData
        .filter(
          (tx) =>
            tx.categoryId === cat.id &&
            tx.date >= lastMonthStart &&
            tx.date < lastMonthEnd
        )
        .reduce((sum, tx) => sum + tx.amount, 0);

      const thisMonthExpenses = expenseData
        .filter(
          (tx) =>
            tx.categoryId === cat.id &&
            tx.date >= thisMonthStart &&
            tx.date < now
        )
        .reduce((sum, tx) => sum + tx.amount, 0);

      if (lastMonthExpenses === 0 && thisMonthExpenses > 0) {
        return `New expenses in category "${cat.name}".`;
      } else if (lastMonthExpenses > 0) {
        const ratio = thisMonthExpenses / lastMonthExpenses;
        if (ratio >= 1.5) {
          return `Expenses in "${cat.name}" are ${(
            ratio * 100
          ).toFixed(0)}% of last month.`;
        }
      }
      return null;
    }).filter(Boolean);

    // 3. Revenue Insights
    const revenueData = await prisma.transaction.findMany({
      where: {
        companyId,
        category: { type: 'INCOME' },
        date: { lt: now },
      },
      select: {
        date: true,
        amount: true,
      },
    });

    const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
      const start = new Date(now.getFullYear(), now.getMonth() - i - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return revenueData
        .filter((tx) => tx.date >= start && tx.date < end)
        .reduce((sum, tx) => sum + tx.amount, 0);
    });

    const avgRev =
      monthlyRevenue.reduce((sum, rev) => sum + rev, 0) / monthlyRevenue.length;

    const thisMonthRevenue = revenueData
      .filter((tx) => tx.date >= thisMonthStart && tx.date < now)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const revenueInsights = [];
    if (avgRev > 0 && thisMonthRevenue < avgRev * 0.5) {
      revenueInsights.push(
        `This month’s revenue (${thisMonthRevenue.toFixed(
          2
        )}) is below 50% of average (${avgRev.toFixed(2)}).`
      );
    }

    // Combine all insights
    const insights = [
      ...budgetInsights,
      ...spendingInsights,
      ...revenueInsights,
    ];

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}