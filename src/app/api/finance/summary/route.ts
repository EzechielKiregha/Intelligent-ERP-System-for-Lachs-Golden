// app/api/finance/summary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Optional query params schema
const QuerySchema = z.object({
  period: z.enum(['month', 'week', 'year']).optional(), // choose which periods to compare
  startDate: z.string().optional().refine(s => !s || !isNaN(Date.parse(s)), { message: 'Invalid date' }),
  endDate: z.string().optional().refine(s => !s || !isNaN(Date.parse(s)), { message: 'Invalid date' }),
});

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
  // Parse query
  // Parse query
  const url = new URL(req.url)
  const parse = QuerySchema.safeParse({
    period: url.searchParams.get('period') || undefined,
    startDate: url.searchParams.get('startDate') || undefined,
    endDate: url.searchParams.get('endDate') || undefined,
  })
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid params', details: parse.error.errors }, { status: 400 })
  }
  const { period, startDate, endDate } = parse.data

  // Helper to get date ranges
  const now = new Date()
  let currStart: Date, currEnd: Date, prevStart: Date, prevEnd: Date

  if (startDate && endDate) {
    // Custom range: compare to previous range of same length immediately before
    currStart = new Date(startDate)
    currEnd = new Date(endDate)
    currEnd.setHours(23,59,59,999)
    const diff = currEnd.getTime() - currStart.getTime()
    prevEnd = new Date(currStart.getTime() - 1) // day before currStart
    prevStart = new Date(prevEnd.getTime() - diff)
  } else if (period === 'week') {
    // Current week (Mon-Sun) or last 7 days? Here assume last 7 days vs previous 7 days
    currEnd = new Date()
    currStart = new Date()
    currStart.setDate(currEnd.getDate() - 7)
    prevEnd = new Date(currStart.getTime() - 1)
    prevStart = new Date(prevEnd.getTime() - 7)
  } else if (period === 'year') {
    // Year-to-date vs previous year-to-date
    currStart = new Date(now.getFullYear(), 0, 1)
    currEnd = new Date()
    prevStart = new Date(now.getFullYear() - 1, 0, 1)
    // previous period ends on same month/day last year
    prevEnd = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate(), 23,59,59,999)
  } else {
    // Default to month: current month-to-date vs previous month-to-date
    currStart = new Date(now.getFullYear(), now.getMonth(), 1)
    currEnd = new Date()
    // previous month start
    const prevMonth = now.getMonth() - 1
    const prevYear = prevMonth < 0 ? now.getFullYear() - 1 : now.getFullYear()
    const prevMonthIndex = (prevMonth + 12) % 12
    prevStart = new Date(prevYear, prevMonthIndex, 1)
    // previous end: either last day of previous month or same day index?
    // For month-to-date comparison, use same day-of-month or month end if shorter:
    const day = now.getDate()
    const daysInPrevMonth = new Date(prevYear, prevMonthIndex + 1, 0).getDate()
    const endDay = Math.min(day, daysInPrevMonth)
    prevEnd = new Date(prevYear, prevMonthIndex, endDay, 23,59,59,999)
  }

  // Function to sum income/expense in a range
  async function sumByType(type: 'INCOME' | 'EXPENSE', start: Date, end: Date) {
    const agg = await prisma.transaction.aggregate({
      where: {
        companyId: companyId || undefined,
        category: { type },
        date: { gte: start, lte: end },
      },
      _sum: { amount: true },
    })
    return agg._sum.amount ?? 0
  }

  try {
    // Current sums
    const currRevenue = await sumByType('INCOME', currStart, currEnd)
    const currExpenses = await sumByType('EXPENSE', currStart, currEnd)
    const currNet = currRevenue - currExpenses
    // Previous sums
    const prevRevenue = await sumByType('INCOME', prevStart, prevEnd)
    const prevExpenses = await sumByType('EXPENSE', prevStart, prevEnd)
    const prevNet = prevRevenue - prevExpenses

    return NextResponse.json({
      totalRevenue: currRevenue,
      prevRevenue,
      totalExpenses: currExpenses,
      prevExpenses,
      netProfit: currNet,
      prevNetProfit: prevNet,
      period: period || (startDate && endDate ? 'custom' : 'month'),
      // Optionally also return the date ranges used:
      ranges: {
        currStart: currStart.toISOString(),
        currEnd: currEnd.toISOString(),
        prevStart: prevStart.toISOString(),
        prevEnd: prevEnd.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error computing summary with period:', error)
    return NextResponse.json({ error: 'Failed to compute summary' }, { status: 500 })
  }
}