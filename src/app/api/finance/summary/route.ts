import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Calculate total revenue (income)
    const totalRevenue = await prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        category: {
          type: 'INCOME', // Filter by CategoryType
        },
      },
    });

    // Calculate total expenses
    const totalExpenses = await prisma.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        category: {
          type: 'EXPENSE', // Filter by CategoryType
        },
      },
    });

    // Handle undefined values gracefully
    const revenueAmount = totalRevenue._sum.amount || 0;
    const expenseAmount = totalExpenses._sum.amount || 0;

    // Calculate net profit
    const netProfit = revenueAmount - expenseAmount;

    return NextResponse.json({
      totalRevenue: revenueAmount,
      totalExpenses: expenseAmount,
      netProfit,
    });
  } catch (error) {
    console.error('Error fetching finance summary:', error);
    return NextResponse.json({ error: 'Failed to fetch finance summary' }, { status: 500 });
  }
}