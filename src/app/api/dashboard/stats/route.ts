import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  // 1. Auth check
  const session = await getServerSession(authOptions);
  if (!session?.user?.currentCompanyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const companyId = session.user.currentCompanyId;

  try {
    // Fetch all transactions for the company
    const transactions = await prisma.transaction.findMany({
      where: { companyId },
      select: { amount: true },
    });

    // Calculate total revenue manually
    const totalRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const revPercentage = totalRevenue > 0 ? (totalRevenue / 100) * 100 : 0;

    // Count total orders
    const totalOrders = await prisma.transaction.count({
      where: { type: 'ORDER', companyId },
    });
    const orderPercentage = totalOrders > 0 ? (totalOrders / 100) * 100 : 0;

    // Count total customers
    const totalCustomers = await prisma.user.count({
      where: { companyId },
    });
    const customerPercentage = totalCustomers > 0 ? (totalCustomers / 100) * 100 : 0;

    // Return the aggregated stats
    return NextResponse.json({
      totalRevenue,
      totalOrders,
      totalCustomers,
      revPercentage,
      orderPercentage,
      customerPercentage,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}