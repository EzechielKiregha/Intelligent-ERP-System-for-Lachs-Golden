import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Aggregate data for dashboard stats
    const totalRevenue = await prisma.transaction.aggregate({
      _sum: { amount: true },
    });

    const totalOrders = await prisma.transaction.count({
      where: { type: 'ORDER' },
    });

    const totalCustomers = await prisma.customer.count();

    return NextResponse.json({
      totalRevenue: totalRevenue._sum.amount || 0,
      totalOrders,
      totalCustomers,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}