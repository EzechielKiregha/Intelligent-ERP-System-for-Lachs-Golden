import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.currentCompanyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const companyId = session.user.currentCompanyId;

  try {
    const url = new URL(req.url);
    const range = url.searchParams.get('range') || 'last7days';

    const now = new Date();
    let startDate: Date;
    let endDate = now;

    // Determine the date range
    switch (range) {
      case 'last7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
        break;
      case 'last30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
        break;
      case 'lastquarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1); // Last quarter
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Default to last 7 days
    }

    // Fetch revenue data for the current range
    const currentTransactions = await prisma.transaction.findMany({
      where: {
        companyId,
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
        category: {
          type: 'INCOME',
        },
      },
      select: { amount: true },
    });

    // Calculate total revenue for the current range
    const currentRevenue = currentTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    // Calculate the previous range
    const previousStartDate = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));
    const previousEndDate = new Date(startDate);

    // Fetch revenue data for the previous range
    const previousTransactions = await prisma.transaction.findMany({
      where: {
        companyId,
        createdAt: {
          gte: previousStartDate,
          lt: previousEndDate,
        },
        category: {
          type: 'INCOME',
        },
      },
      select: { amount: true },
    });

    // Calculate total revenue for the previous range
    const previousRevenue = previousTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    // Calculate the percentage change
    const changePercent = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    // Return the response
    return NextResponse.json([
      {
        quarter: range === 'lastquarter' ? 'Last Quarter' : range === 'last30days' ? 'Last 30 Days' : 'Last 7 Days',
        revenue: currentRevenue,
        changePercent: parseFloat(changePercent.toFixed(2)),
      },
    ]);
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch revenue analytics' }, { status: 500 });
  }
}