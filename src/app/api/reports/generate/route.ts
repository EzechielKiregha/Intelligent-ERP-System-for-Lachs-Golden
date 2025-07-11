import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {

  // 1. Auth check
    const session = await getServerSession(authOptions)
      if (!session?.user?.currentCompanyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const companyId = session.user.currentCompanyId
  
    if (!companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  try {
    // Parse the request body
    const body = await req.json();
    const { type, dateRange } = body;

    // Define date range for filtering
    const now = new Date();
    let startDate: Date;

    if (dateRange === 'last7days') {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (dateRange === 'last30days') {
      startDate = new Date(now.setDate(now.getDate() - 30));
    } else if (dateRange === 'lastquarter') {
      startDate = new Date(now.setMonth(now.getMonth() - 3));
    } else {
      startDate = new Date(now.setDate(now.getDate() - 7)); // Default to last 7 days
    }

    let reportData;

    // Generate report based on type
    switch (type) {
      case 'revenue':
        reportData = await prisma.transaction.groupBy({
          by: ['createdAt'],
          _sum: { amount: true },
          where: {
            companyId,
            createdAt: {
              gte: startDate,
            },
          },
          orderBy: { createdAt: 'asc' },
        });
        break;

      case 'inventory':
        reportData = await prisma.product.findMany({
          where: {
            companyId,
            quantity: {
              lte: 10, // Low stock threshold
            },
          },
          orderBy: { quantity: 'asc' },
        });
        break;

      case 'activities':
        reportData = await prisma.auditLog.findMany({
          where :{
            companyId,
          },
          orderBy: { timestamp: 'desc' },
          take: 20, // Limit to the 20 most recent activities
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    return NextResponse.json({ reportType: type, reportData });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}