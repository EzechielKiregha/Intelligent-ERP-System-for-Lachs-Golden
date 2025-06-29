// app/api/inventory/summary/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    // 1. Top metrics
    const [totalProducts, lowStockCount, products] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { quantity: { lt:  100 } } }),
      prisma.product.findMany({ select: { quantity: true, unitPrice: true, createdAt: true } }),
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
      where: { type: 'ORDER' },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
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
