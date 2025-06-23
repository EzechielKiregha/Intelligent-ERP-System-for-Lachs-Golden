import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TransactionType } from '@/generated/prisma';


export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const companyId = session.user.companyId;

  try {
    const url = new URL(req.url);
    const range = url.searchParams.get('range') || 'last7days';

    const now = new Date();
    let startDate: Date;
    let endDate = now;

    switch (range) {
      case 'last7days':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'last30days':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case 'lastquarter':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    

    // Fetch revenue data for the current range
    const currentRevenue = await prisma.transaction.aggregate({
      where: {
        companyId,
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
        category : {
          type : 'INCOME'
        },
      },
      _sum: { amount: true },
    });

    // Fetch revenue data for the previous range
    const previousStartDate = new Date(startDate);
    const previousEndDate = new Date(endDate);
    previousStartDate.setDate(startDate.getDate() - (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    previousEndDate.setDate(endDate.getDate() - (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const previousRevenue = await prisma.transaction.aggregate({
      where: {
        companyId,
        createdAt: {
          gte: previousStartDate,
          lt: previousEndDate,
        },
        category : {
          type : 'INCOME'
        },
      },
      _sum: { amount: true },
    });

    const revenue = currentRevenue._sum.amount || 0;
    const previous = previousRevenue._sum.amount || 0;
    const changePercent = previous > 0 ? ((revenue - previous) / previous) * 100 : 0;

    return NextResponse.json([
      {
        quarter: range === 'lastquarter' ? 'Last Quarter' : range === 'last30days' ? 'Last 30 Days' : 'Last 7 Days',
        revenue,
        changePercent: parseFloat(changePercent.toFixed(2)),
      },
    ]);
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch revenue analytics' }, { status: 500 });
  }
}