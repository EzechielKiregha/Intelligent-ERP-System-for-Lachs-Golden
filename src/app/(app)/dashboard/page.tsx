'use client';

import React from 'react';
import { useDashboardStats, useRevenueAnalytics, useRecentActivities, useAIInsights, useAuditLog } from '@/lib/hooks/dashboard';
import SalesDistribution from './_components/SalesDistribution';
import ActivityFeed from './_components/ActivityFeed';
import AIInsights from './_components/AIInsights';
// import { DollarSign } from 'react-feather';
import SkeletonLoader from '../_components/SkeletonLoader';
import AuthGuard from '../_components/AuthGuard';
import FinanceSummaryCards from '../finance/_components/FinanceSummaryCards';
import { MetricCard } from './_components/MetricCards';
import { DollarSign, GroupIcon, ShoppingCart, Users } from 'lucide-react';
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
    <AuthGuard>
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 flex flex-col ">
          <main className="flex-1 overflow-auto p-6 pt-4">
            {/* Show Skeleton Loader if loading */}
            {statsLoading && <SkeletonLoader height={40} type="card" count={3} />}

            {/* Metric Cards */}
            {!statsLoading && stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Total Revenue */}
                <MetricCard
                  icon={<DollarSign className="w-6 h-6 text-[#f0eadb] dark:text-[#f3edd8]" />}
                  title="Total Revenue"
                  value={`$${stats.totalRevenue.toLocaleString()}`}
                  delta="132%" // Replace with actual delta if available
                  deltaType="increase" // Replace with 'increase' or 'decrease' if applicable
                  footerMessage="Revenue generated so far"
                  footerSubtext=""
                />

                {/* Total Orders */}
                <MetricCard
                  icon={<ShoppingCart className="w-6 h-6 text-[#f0eadb] dark:text-[#f3edd8]" />}
                  title="Total Orders"
                  value={stats.totalOrders.toLocaleString()}
                  delta="12%" // Replace with actual delta if available
                  deltaType="increase" // Replace with 'increase' or 'decrease' if applicable
                  footerMessage="Orders processed so far"
                  footerSubtext=""
                />

                {/* Total Customers */}
                <MetricCard
                  icon={<Users className="w-6 h-6 text-[#f0eadb] dark:text-[#f3edd8]" />}
                  title="Total Customers"
                  value={stats.totalCustomers.toLocaleString()}
                  delta="2.3%" // Replace with actual delta if available
                  deltaType="decrease" // Replace with 'increase' or 'decrease' if applicable
                  footerMessage="Customers served so far"
                  footerSubtext=""
                />
              </div>
            )}

            {/* Forecast Chart & Budget Section */}
            <div className="grid grid-rows-1 lg:grid-rows-2 gap-6 mb-6">
              <FinanceForecastSection />
              <CategoriesList />
            </div>

            {/* Revenue Analytics & Sales Distribution */}
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
            <div className="grid grid-rows-1 lg:grid-rows-2 gap-6 mb-6">

              {logsLoading && <Skeleton className="h-40 w-full rounded-lg bg-sidebar" />}
              {/* Recent Activities */}
              {!logsLoading && auditLogs && (
                <ActivityFeed auditLogs={auditLogs} />
              )}
              {/* AI Insights Section */}
              {!insightsLoading && insightsData && (
                <FinancialInsights />
              )}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}