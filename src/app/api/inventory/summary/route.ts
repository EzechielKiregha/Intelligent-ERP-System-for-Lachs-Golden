import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Fetch inventory summary metrics
    const totalItems = await prisma.product.count();

    const lowStockItems = await prisma.product.count({
      where: {
        quantity: {
          lte: 10, // Items with stock less than or equal to 10
        },
      },
    });

    const pendingOrders = await prisma.transaction.count({
      where: {
        type: 'ORDER',
        status: 'PENDING', // Assuming 'status' exists in the Transaction model
      },
    });

    return NextResponse.json({
      totalItems,
      lowStockItems,
      pendingOrders,
    });
  } catch (error) {
    console.error('Error fetching inventory summary:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory summary' }, { status: 500 });
  }
}