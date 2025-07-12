'use client';

import React from 'react';
import { useDashboardStats, useRevenueAnalytics, useAIInsights, useAuditLog } from '@/lib/hooks/dashboard';
import SalesDistribution from './_components/SalesDistribution';
import ActivityFeed from './_components/ActivityFeed';
import AIInsights from './_components/AIInsights';
// import { DollarSign } from 'react-feather';
import SkeletonLoader from '../_components/SkeletonLoader';
import { MetricCard } from './_components/MetricCards';
import { DollarSign, ShoppingCart, Users } from 'lucide-react';
import RevenueAnalytics from './_components/RevenueAnalytics';
import FinanceForecastSection from '../finance/_components/FinanceForecastSection';
import CategoriesList from '../finance/_components/CategoryList';
import { useInventorySummary } from '@/lib/hooks/inventory';
import { Skeleton } from '@/components/ui/skeleton';
import FinancialInsights from '../finance/_components/FinancialInsights';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const [range, setRange] = React.useState('last7days');
  const { data: revenueData, isLoading: revenueLoading } = useRevenueAnalytics(range || 'last7days');
  const { data: inventoryData, isLoading: inventoryLoading } = useInventorySummary();
  const { data: insightsData, isLoading: insightsLoading } = useAIInsights();
  const { data: auditLogs, isLoading: logsLoading } = useAuditLog()

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {statsLoading && <SkeletonLoader height={40} type="card" count={3} />}
          {!statsLoading && stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
              <MetricCard
                icon={<DollarSign className="w-6 h-6 text-[#f0eadb] dark:text-[#f3edd8]" />}
                title="Total Revenue"
                value={`$${stats.totalRevenue.toLocaleString()}`}
                delta={`${stats.revPercentage * 100}%`} // Replace with actual delta if available
                deltaType={`${stats.revPercentage > 20 ? "increase" : stats.revPercentage < 20 ? "decrease" : "neutral"}`} // Replace with 'increase' or 'decrease' if applicable
                footerMessage="Revenue generated so far"
                footerSubtext="This average over all transactions made in the company <=> 20% increase"
              />

              <MetricCard
                icon={<ShoppingCart className="w-6 h-6 text-[#f0eadb] dark:text-[#f3edd8]" />}
                title="Total Orders"
                value={stats.totalOrders.toLocaleString()}
                delta={`${stats.orderPercentage * 100}%`} // Replace with actual delta if available
                deltaType={`${stats.orderPercentage > 0 ? "increase" : stats.orderPercentage < 0 ? "decrease" : "neutral"}`} // Replace with 'increase' or 'decrease' if applicable
                footerMessage="Orders processed so far"
                footerSubtext="This is over number of orders made in the company"
              />

              <MetricCard
                icon={<Users className="w-6 h-6 text-[#f20eadb] dark:text-[#f3edd8]" />}
                title="Total Customers"
                value={stats.totalCustomers.toLocaleString()}
                delta={`${stats.customerPercentage * 100}%`} // Replace with actual delta if available
                deltaType={`${stats.customerPercentage > 0 ? "increase" : stats.customer < 0 ? "decrease" : "neutral"}`} // Replace with 'increase' or 'decrease' if applicable
                footerMessage="Customers served so far"
                footerSubtext="This is over number of users registered in the company"
              />
            </div>
          )}

          <div className="mb-4">
            <FinanceForecastSection />
          </div>
          <div >
            <CategoriesList />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {revenueLoading && <Skeleton className="h-40 w-full rounded-lg bg-sidebar" />}
            {!revenueLoading && revenueData && (
              <RevenueAnalytics data={revenueData} range={range} onRangeChange={setRange} />
            )}
            {inventoryLoading && <Skeleton className="h-40 w-full rounded-lg bg-sidebar" />}
            {!inventoryLoading && inventoryData && (
              <SalesDistribution data={{
                totalItems: inventoryData.totalProducts,
                lowStock: inventoryData.lowStockCount,
                pendingOrders: inventoryData.recentOrders.length
              }} />
            )}
          </div>
          <div className="hidden lg:px-6">
            {logsLoading && <Skeleton className="h-40 w-full rounded-lg bg-sidebar" />}
            {!logsLoading && auditLogs && (
              <ActivityFeed auditLogs={auditLogs} />
            )}
          </div>
          <div >
            {insightsLoading && <Skeleton className="h-40 w-full rounded-lg bg-sidebar" />}
            {!insightsLoading && insightsData && (
              <FinancialInsights />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}