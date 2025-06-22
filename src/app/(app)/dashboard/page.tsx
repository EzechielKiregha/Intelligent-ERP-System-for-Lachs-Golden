'use client';

import React from 'react';
import { useDashboardStats, useRevenueAnalytics, useInventorySummary, useRecentActivities, useAIInsights } from '@/lib/hooks/dashboard';
// import MetricCards from './_components/MetricCards';
// import RevenueAnalytics from './_components/RevenueAnalytics';
import SalesDistribution from './_components/SalesDistribution';
import ActivityFeed from './_components/ActivityFeed';
import AIInsights from './_components/AIInsights';
// import { DollarSign } from 'react-feather';
import SkeletonLoader from '../_components/SkeletonLoader';
import AuthGuard from '../_components/AuthGuard';
import FinanceSummaryCards from '../finance/_components/FinanceSummaryCards';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const [range, setRange] = React.useState('last7days');
  const { data: revenueData, isLoading: revenueLoading } = useRevenueAnalytics(range);
  const { data: inventoryData, isLoading: inventoryLoading } = useInventorySummary();
  const { data: activitiesData, isLoading: activitiesLoading } = useRecentActivities();
  const { data: insightsData, isLoading: insightsLoading } = useAIInsights();

  const loading = statsLoading || revenueLoading || inventoryLoading || activitiesLoading || insightsLoading;

  return (
    <AuthGuard>
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-auto bg-white dark:bg-[#111827] p-6 pt-4">
            {/* Show Skeleton Loader if loading */}
            {loading && <SkeletonLoader type="card" count={4} />}

            {/* Metric Cards */}
            {!statsLoading && stats && (

              <FinanceSummaryCards />

              // <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              //   <MetricCards
              //     icon={<DollarSign className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />}
              //     title="Total Revenue"
              //     value={`$${stats.totalRevenue.toLocaleString()}`}
              //     delta={`${stats.revenueChange > 0 ? '+' : ''}${stats.revenueChange}%`}
              //     deltaType={stats.revenueChange >= 0 ? 'increase' : 'decrease'}
              //     subtitle="vs last month"
              //   />

              //   {/* Add other MetricCards for New Orders, Total Customers, Inventory Status */}
              // </div>
            )}

            {/* Revenue Analytics & Sales Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* {!revenueLoading && revenueData && (
                <RevenueAnalytics data={revenueData} range={range} onRangeChange={setRange} />
              )} */}
              {!inventoryLoading && inventoryData && (
                <SalesDistribution data={inventoryData} />
              )}
            </div>
            <div className="grid grid-rows-1 lg:grid-rows-2 gap-6 mb-6">

              {/* Recent Activities */}
              {!activitiesLoading && activitiesData && (
                <ActivityFeed activities={activitiesData} />
              )}

              {/* AI Insights Section */}
              {!insightsLoading && insightsData && (
                <AIInsights
                  insights={insightsData}
                  onGenerateReport={() => console.log('Generate Report')}
                />
              )}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}