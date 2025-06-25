import { NextRequest, NextResponse } from 'next/server'
import prisma  from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const [totalProducts, outOfStock, belowThreshold, inventoryValueAgg] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { quantity: 0 } }),
      prisma.product.count({ where: { quantity: { lt: 10 } } }),
      prisma.product.findMany({
        select: { quantity: true, unitPrice: true },
      }),
    ])

    const totalInventoryCost = inventoryValueAgg.reduce((acc, item) => {
      return acc + (item.quantity * (item.unitPrice || 0))
    }, 0)

    return NextResponse.json({
      totalProducts,
      outOfStock,
      belowThreshold,
      totalInventoryCost,
    })
  } catch (error) {
    console.error('Inventory summary error:', error)
    return NextResponse.json({ error: 'Failed to load inventory summary' }, { status: 500 })
  }
}
