import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Extract the range parameter from the query string
    const url = new URL(req.url);
    const range = url.searchParams.get('range') || 'last7days';

    // Define date ranges
    const now = new Date();
    let startDate: Date;

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
        startDate = new Date(now.setDate(now.getDate() - 7)); // Default to last 7 days
    }

    // Fetch revenue data within the specified range
    const revenueData = await prisma.transaction.groupBy({
      by: ['createdAt'],
      _sum: { amount: true },
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(revenueData);
  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch revenue analytics' }, { status: 500 });
  }
}