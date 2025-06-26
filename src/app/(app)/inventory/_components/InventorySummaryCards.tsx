// app/inventory/_components/InventorySummaryCards.tsx
'use client'
import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { useInventorySummary } from '@/lib/hooks/inventory'
import StockTrendChart from './StockTrendChart'
import RecentOrdersList from './RecentOrdersList'
import { MetricCard } from '../../_components/MetricCard'

export default function InventorySummaryCards() {
  const { data, isLoading, isError } = useInventorySummary()

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-lg bg-sidebar" />
  }
  if (isError || !data) {
    return <p className="text-red-600">Failed to load inventory summary.</p>
  }

  const { totalProducts, lowStockCount, totalInventoryCost, trend, recentOrders } = data

  const formatNumber = (v: number) => v.toLocaleString()
  const formatCurrency = (v: number) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
    }).format(v)

  return (
    <div className="space-y-6">
      {/* Top cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        <MetricCard
          description="Total Products"
          value={totalProducts}
          formatValue={formatNumber}
          footerMessage="All items"
        />
        <MetricCard
          description="Low Stock"
          value={lowStockCount}
          formatValue={formatNumber}
          footerMessage="Below threshold"
        />
        <MetricCard
          description="Inventory Value"
          value={totalInventoryCost}
          formatValue={formatCurrency}
          footerMessage="Total cost of goods"
        />
      </div>

      {/* Trend chart */}
      <StockTrendChart data={trend} />

      {/* Recent orders */}
      <RecentOrdersList orders={recentOrders} />
    </div>
  )
}
