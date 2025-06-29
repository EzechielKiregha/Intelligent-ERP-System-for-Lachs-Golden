'use client'
import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { useHRSummary } from '@/lib/hooks/hr'
import { MetricCard } from '../../_components/MetricCard'

export default function HRStatsCards() {
  const { data, isLoading, isError } = useHRSummary()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg bg-sidebar" />
        ))}
      </div>
    )
  }
  if (isError || !data) {
    return <p className="text-red-600">Failed to load HR summary.</p>
  }

  const {
    totalEmployees,
    departmentCount,
    pendingTasks,
    documentCount,
    payrollThisMonth,
  } = data

  const formatNumber = (v: number) => v.toLocaleString()
  const formatCurrency = (v: number) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(v)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
      <MetricCard
        description="Employees"
        value={totalEmployees}
        formatValue={formatNumber}
        footerMessage="Total headcount"
      />
      <MetricCard
        description="Departments"
        value={departmentCount}
        formatValue={formatNumber}
        footerMessage="Active departments"
      />
      <MetricCard
        description="Pending Tasks"
        value={pendingTasks}
        formatValue={formatNumber}
        footerMessage="Requires attention"
      />
      <MetricCard
        description="Documents"
        value={documentCount}
        formatValue={formatNumber}
        footerMessage="Uploaded records"
      />
      <MetricCard
        description="Payroll (This Month)"
        value={payrollThisMonth}
        formatValue={formatCurrency}
        footerMessage="Net paid"
      />
    </div>
  )
}
