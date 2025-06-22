'use client'
import React from 'react'
import { useFinanceForecast } from '@/lib/hooks/finance'
import { InteractiveAreaChart } from './InteractiveAreaChart'

export default function FinanceForecastSection() {
  const { data, isLoading, isError } = useFinanceForecast()

  if (isLoading) return <p>Loading chart...</p>
  if (isError || !data) return <p>Error loading forecast.</p>

  // Transform past & forecast into uniform date strings "YYYY-MM-01"
  const combined = [
    ...data.past.map(item => {
      // month like "2025-04"; convert to first day
      const [year, month] = item.month.split('-')
      return {
        date: `${year}-${month}-01`,
        income: item.revenue,
        expense: item.expenses,
      }
    }),
    ...data.forecast.map(item => {
      const [year, month] = item.month.split('-')
      return {
        date: `${year}-${month}-01`,
        income: item.projectedRevenue,
        expense: item.projectedExpenses,
      }
    }),
  ]

  return (
    <InteractiveAreaChart
      title="Income vs Expense"
      description="Past and projected"
      data={combined}
      dateKey="date"
      series={[
        { key: 'income', label: 'Income', colorVar: '--sidebar-primary' },
        { key: 'expense', label: 'Expense', colorVar: '--sidebar-accent' },
      ]}
    // using default timeRangeOptions; or pass custom if desired
    />
  )
}
