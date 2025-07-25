// app/api/inventory/summary/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
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
    // 1. Top metrics
    const [totalProducts, lowStockCount, products] = await Promise.all([
      prisma.product.count({ where: { companyId } }),
      prisma.product.count({ where: { companyId, quantity: { lt:  prisma.product.fields.threshold } } }),
      prisma.product.findMany({ where:{ companyId }, select: { quantity: true, unitPrice: true, createdAt: true } }),
    ])

    // Compute total inventory cost
    const totalInventoryCost = products.reduce(
      (sum, p) => sum + p.quantity * (p.unitPrice ?? 0),
      0
    )

    // 2. Trend data (last 6 months)
    const now = new Date()
    const trend: Array<{ month: string; stock: number; cost: number }> = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`

      // Approximate snapshot by summing products created <= end of month
      const monthEnd = new Date(date.getFullYear(), date.getMonth()+1, 1)
      const monthProducts = products.filter(p => p.createdAt < monthEnd)
      const monthStock = monthProducts.reduce((s, p) => s + p.quantity, 0)
      const monthCost = monthProducts.reduce((s, p) => s + p.quantity * (p.unitPrice ?? 0), 0)

      trend.push({ month: monthKey, stock: monthStock, cost: monthCost })
    }

    // 3. Recent ORDER transactions
    const recentOrders = await prisma.transaction.findMany({
      where: { companyId, type: 'ORDER' },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      totalProducts,
      lowStockCount,
      totalInventoryCost,
      trend,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        date: o.createdAt,
        description: o.description,
        amount: o.amount,
        status: o.status,
      })),
    })
  } catch (error) {
    console.error('Inventory summary error:', error)
    return NextResponse.json({ error: 'Failed to load inventory summary' }, { status: 500 })
  }
}
