// app/inventory/_components/InventorySummaryCards.tsx
'use client'
import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { useInventorySummary } from '@/lib/hooks/inventory'
import StockTrendChart from './StockTrendChart'
import RecentOrdersList from './RecentOrdersList'
import { MetricCard } from '../../_components/MetricCard'
import SkeletonLoader from '../..//_components/SkeletonLoader'
import Link from 'next/link'

export default function InventorySummaryCards() {
  const { data, isLoading, isError } = useInventorySummary()

  if (isLoading) {
    return (
      <>
        <div className="space-y-2">
          <SkeletonLoader height={40} type="card" count={3} />
        </div>
      </>
    )
  }

  if (isError || !data) {
    return (
      <div className="bg-sidebar text-sidebar-foreground p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold">No Inventory Data Found</h3>
        <p className="text-sm">
          Start managing your inventory by adding products and connecting your e-commerce platform.
        </p>
        <div className="mt-4 space-y-2 flex flex-row justify-between items-start">
          <Link href="/inventory/manage" className="text-sm text-[#A17E25] hover:underline dark:text-[#D4AF37]">
            Add Products
          </Link>
          <Link href="/inventory/integrations" className="text-sm text-[#A17E25] hover:underline dark:text-[#D4AF37]">
            Connect E-commerce
          </Link>
        </div>
      </div>
    )
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
