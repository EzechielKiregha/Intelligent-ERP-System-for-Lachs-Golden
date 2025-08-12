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
    const transactions = await prisma.transaction.findMany({
      where: { companyId },
      select: { amount: true },
    });

    const totalRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const revPercentage = totalRevenue > 0 ? (totalRevenue / transactions.length) : 0;

    const totalOrders = await prisma.transaction.count({
      where: { type: 'ORDER', companyId },
    });
    const orderPercentage = totalOrders > 0 ? (totalOrders / 100) * 100 : 0;

    const totalUsers = await prisma.user.count({
      where: { companyId },
    });
    const customerPercentage = totalUsers > 0 ? (totalUsers / 100) * 100 : 0;

    return NextResponse.json({
      totalRevenue: totalRevenue || 0,
      totalOrders: totalOrders || 0,
      totalUsers: totalUsers || 0,
      revPercentage: parseFloat(revPercentage.toFixed(2)) || 0,
      orderPercentage: parseFloat(orderPercentage.toFixed(2)) || 0,
      customerPercentage: parseFloat(customerPercentage.toFixed(2)) || 0,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}