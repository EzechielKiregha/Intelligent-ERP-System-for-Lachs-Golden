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
    let revPercentage =   (totalRevenue > 0 ? (totalRevenue / transactions.length) : 0);
    revPercentage = parseFloat(revPercentage.toFixed(2))
    // Count total orders
    const totalOrders = await prisma.transaction.count({
      where: { type: 'ORDER', companyId },
    });
    let orderPercentage = totalOrders > 0 ? (totalOrders / 100) * 100 : 0;
    orderPercentage = parseFloat(orderPercentage.toFixed(2));

    // Count total customers
    const totalCustomers = await prisma.user.count({
      where: { companyId },
    });
    let customerPercentage = totalCustomers > 0 ? (totalCustomers / 100) * 100 : 0;
    customerPercentage = parseFloat(customerPercentage.toFixed(2));

    // Return the aggregated stats
    return NextResponse.json({
      totalRevenue: totalRevenue ? totalRevenue.toLocaleString() : '0',
      totalOrders: totalOrders ? totalOrders.toLocaleString() : '0',
      totalCustomers: totalCustomers ? totalCustomers.toLocaleString() : '0',
      revPercentage: revPercentage || 0,
      orderPercentage: orderPercentage || 0,
      customerPercentage: customerPercentage || 0,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}