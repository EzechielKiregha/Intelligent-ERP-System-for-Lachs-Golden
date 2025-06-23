import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {

  // 1. Auth check
  const session = await getServerSession(authOptions)
  if (!session?.user?.companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const companyId = session.user.companyId

  if (!companyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Aggregate data for dashboard stats
    const totalRevenue = await prisma.transaction.aggregate({
      where : {
        companyId
      },
      _sum: { amount: true },
    });

    const totalOrders = await prisma.transaction.count({
      where: { type: 'ORDER', companyId },
    });

    const totalCustomers = await prisma.user.count({
      where : {
        companyId
      }
    });

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