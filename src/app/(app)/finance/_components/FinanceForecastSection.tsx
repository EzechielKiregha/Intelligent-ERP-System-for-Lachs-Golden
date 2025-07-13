'use client'
import React from 'react'
import { useFinanceForecast } from '@/lib/hooks/finance'
import { InteractiveAreaChart } from './InteractiveAreaChart'
import SkeletonLoader from '../../_components/SkeletonLoader'
import { Skeleton } from '@/components/ui/skeleton'

export default function FinanceForecastSection() {
  const { data, isLoading, isError } = useFinanceForecast()

  if (isLoading) return <Skeleton className="h-64 w-full rounded-lg bg-sidebar" />

  const combined = isError || !data
    ? [{ date: '2023-01-01', income: 0, expense: 0 }]
    : [
      ...data.past.map(item => {
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
    />
  )
}
