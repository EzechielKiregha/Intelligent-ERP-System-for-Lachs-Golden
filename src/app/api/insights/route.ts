// app/api/finance/insights/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
      const companyId = searchParams.get("companyId");
    
      if (!companyId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  try {
    const now = new Date()

    // 1. Budget usage insights
    const categories = await prisma.category.findMany({
      where: { companyId },
      select: { id: true, name: true, budgetLimit: true, budgetUsed: true },
    })
    const budgetInsights: string[] = []
    for (const cat of categories) {
      if (cat.budgetLimit !== null && cat.budgetLimit > 0) {
        const pct = (Number(cat.budgetUsed) / Number(cat.budgetLimit)) * 100
        if (pct >= 100) {
          budgetInsights.push(`Category "${cat.name}" has exceeded its budget.`)
        } else if (pct >= 80) {
          budgetInsights.push(`Category "${cat.name}" is at ${pct.toFixed(0)}% of its budget.`)
        }
      }
    }

    // 2. Unusual spending: compare this month vs last month per category
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1)
    // For each category, sum expenses
    const expenseCats = categories.map(c => c.id)
    const pastSums = await Promise.all(
      expenseCats.map(catId =>
        prisma.transaction.aggregate({
          where: {
            companyId,
            categoryId: catId,
            category: { type: 'EXPENSE' },
            date: { gte: lastMonthStart, lt: lastMonthEnd },
          },
          _sum: { amount: true },
        }).then(res => ({ catId, sum: res._sum.amount ?? 0 }))
      )
    )
    const currentSums = await Promise.all(
      expenseCats.map(catId =>
        prisma.transaction.aggregate({
          where: {
            companyId,
            categoryId: catId,
            category: { type: 'EXPENSE' },
            date: { gte: thisMonthStart, lt: new Date() },
          },
          _sum: { amount: true },
        }).then(res => ({ catId, sum: res._sum.amount ?? 0 }))
      )
    )
    const spendingInsights: string[] = []
    for (const cur of currentSums) {
      const past = pastSums.find(p => p.catId === cur.catId)
      if (past) {
        // if last month was zero and current > 0, flag new spending
        if (past.sum === 0 && cur.sum > 0) {
          const cat = categories.find(c => c.id === cur.catId)
          spendingInsights.push(`New expenses in category "${cat?.name}".`)
        } else if (past.sum > 0) {
          const ratio = cur.sum / past.sum
          if (ratio >= 1.5) {
            const cat = categories.find(c => c.id === cur.catId)
            spendingInsights.push(
              `Expenses in "${cat?.name}" are ${ (ratio*100).toFixed(0) }% of last month.`
            )
          }
        }
      }
    }

    // 3. Revenue alert: compare this month revenue vs average monthly revenue over past 6 months
    // Sum monthly revenue for past 6 months
    const revSums: number[] = []
    for (let i = 1; i <= 6; i++) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const agg = await prisma.transaction.aggregate({
        where: {
          companyId,
          category: { type: 'INCOME' },
          date: { gte: start, lt: end },
        },
        _sum: { amount: true },
      })
      revSums.push(Number(agg._sum.amount ?? 0))
    }
    const avgRev = revSums.reduce((a, b) => a + b, 0) / revSums.length
    // This month revenue so far
    const thisRevAgg = await prisma.transaction.aggregate({
      where: {
        companyId,
        category: { type: 'INCOME' },
        date: { gte: new Date(now.getFullYear(), now.getMonth(), 1), lt: new Date() },
      },
      _sum: { amount: true },
    })
    const thisRev = Number(thisRevAgg._sum.amount ?? 0)
    const revenueInsights: string[] = []
    if (avgRev > 0 && thisRev < avgRev * 0.5) {
      revenueInsights.push(
        `This month’s revenue (${thisRev.toFixed(2)}) is below 50% of average (${avgRev.toFixed(2)}).`
      )
    }

    const insights = [
      ...budgetInsights,
      ...spendingInsights,
      ...revenueInsights,
    ]
    return NextResponse.json({ insights })
  } catch (error) {
    console.error('Error generating insights:', error)
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 })
  }
}
