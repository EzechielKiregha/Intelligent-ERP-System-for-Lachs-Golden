import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Fetch historical transaction data grouped by month
    const forecastData = await prisma.transaction.groupBy({
      by: ['date'],
      _sum: {
        amount: true,
      },
      where: {
        category: {
          type: {
            in: ['INCOME', 'EXPENSE'], // Include both income and expense categories
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Transform data into a format suitable for forecasting
    const transformedData = forecastData.map((entry) => ({
      month: entry.date.toISOString().slice(0, 7), // Extract year-month (e.g., "2025-06")
      totalAmount: entry._sum.amount || 0,
    }));

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    return NextResponse.json({ error: 'Failed to fetch forecast data' }, { status: 500 });
  }
}