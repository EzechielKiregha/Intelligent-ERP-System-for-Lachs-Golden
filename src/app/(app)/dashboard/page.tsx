'use client';

import React from 'react';
import { useDashboardStats, useRevenueAnalytics, useAIInsights, useAuditLog } from '@/lib/hooks/dashboard';
import SalesDistribution from './_components/SalesDistribution';
import ActivityFeed from './_components/ActivityFeed';
import AIInsights from './_components/AIInsights';
import SkeletonLoader from '../_components/SkeletonLoader';
import { MetricCard } from './_components/MetricCards';
import { DollarSign, ShoppingCart, Users } from 'lucide-react';
import RevenueAnalytics from './_components/RevenueAnalytics';
import FinanceForecastSection from '../finance/_components/FinanceForecastSection';
import CategoriesList from '../finance/_components/CategoryList';
import { useInventorySummary } from '@/lib/hooks/inventory';
import { Skeleton } from '@/components/ui/skeleton';
import FinancialInsights from '../finance/_components/FinancialInsights';
import { useAuth } from 'contents/authContext';
import { getGreeting } from '@/lib/utils';
import { useGetCompanyById } from '@/lib/hooks/use-owner-company';

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useDashboardStats();
  const [range, setRange] = React.useState('last7days');
  const { data: revenueData, isLoading: revenueLoading, isError: revenueError } = useRevenueAnalytics(range || 'last7days');
  const { data: inventoryData, isLoading: inventoryLoading, isError: inventoryError } = useInventorySummary();
  const { data: insightsData, isLoading: insightsLoading, isError: insightsError } = useAIInsights();
  const { data: auditLogs, isLoading: logsLoading, isError: logsError } = useAuditLog();

  const currentUser = useAuth().user;
  const { data: company, isLoading: companyLoading, isError: companyError } = useGetCompanyById(currentUser?.currentCompanyId || '');

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div>
            <h2 className="text-2xl font-semibold">
              {getGreeting()} {currentUser.name}
            </h2>
            <h3 className="text-lg text-muted-foreground">
              Welcome to &quot;{company?.name || 'Your Company'}&quot; Dashboard
            </h3>
          </div>

          {/* Stats Section */}
          {statsLoading && <SkeletonLoader height={40} type="card" count={3} />}
          {statsError || !stats ? (
            <div className="bg-sidebar text-sidebar-foreground p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">No Dashboard Stats Found</h3>
              <p className="text-sm">
                Start tracking your company's performance by adding revenue, orders, and customer data.
              </p>
              <div className="mt-4 space-y-2">
                <a href="/finance/transactions" className="text-sm text-[#A17E25] hover:underline dark:text-[#D4AF37]">
                  Add Revenue Records
                </a>
                <a href="/inventory/products" className="text-sm text-[#A17E25] hover:underline dark:text-[#D4AF37]">
                  Add Orders
                </a>
                <a href="/customers" className="text-sm text-[#A17E25] hover:underline dark:text-[#D4AF37]">
                  Add Customers
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
              <MetricCard
                icon={<DollarSign className="w-6 h-6 text-[#f0eadb] dark:text-[#f3edd8]" />}
                title="Total Revenue"
                value={`$${stats.totalRevenue.toLocaleString()}`}
                delta={`${stats.revPercentage * 100}%`}
                deltaType={`${stats.revPercentage > 20 ? "increase" : stats.revPercentage < 20 ? "decrease" : "neutral"}`}
                footerMessage="Revenue generated so far"
                footerSubtext="This average over all transactions made in the company <=> 20% increase"
              />
              <MetricCard
                icon={<ShoppingCart className="w-6 h-6 text-[#f0eadb] dark:text-[#f3edd8]" />}
                title="Total Orders"
                value={stats.totalOrders.toLocaleString()}
                delta={`${stats.orderPercentage * 100}%`}
                deltaType={`${stats.orderPercentage > 0 ? "increase" : stats.orderPercentage < 0 ? "decrease" : "neutral"}`}
                footerMessage="Orders processed so far"
                footerSubtext="This is over number of orders made in the company"
              />
              <MetricCard
                icon={<Users className="w-6 h-6 text-[#f20eadb] dark:text-[#f3edd8]" />}
                title="Total Customers"
                value={stats.totalCustomers.toLocaleString()}
                delta={`${stats.customerPercentage * 100}%`}
                deltaType={`${stats.customerPercentage > 0 ? "increase" : stats.customer < 0 ? "decrease" : "neutral"}`}
                footerMessage="Customers served so far"
                footerSubtext="This is over number of users registered in the company"
              />
            </div>
          )}

          {/* Forecast Chart & Budget Section */}
          <section>
            <FinanceForecastSection />
          </section>

          {/* Transaction List */}
          <section>
            <CategoriesList />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ">
            {/* Finance Forecast Section */}
            {revenueLoading && !revenueError && <Skeleton className="h-40 w-full rounded-lg bg-sidebar" />}
            {inventoryLoading && !inventoryError && <Skeleton className="h-40 w-full rounded-lg bg-sidebar" />}
            {revenueError || !revenueData ? (
              <div className="bg-sidebar text-sidebar-foreground p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold">No Revenue Data Found</h3>
                <p className="text-sm">
                  Start tracking your company's revenue by adding transactions and forecasts.
                </p>
                <a href="/finance/transactions" className="text-sm text-[#A17E25] hover:underline dark:text-[#D4AF37]">
                  Add Transactions
                </a>
              </div>
            ) : (
              <RevenueAnalytics data={revenueData} range={range} onRangeChange={setRange} />
            )}

            {/* Inventory Section */}
            {inventoryError || !inventoryData ? (
              <div className="bg-sidebar text-sidebar-foreground p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold">No Inventory Data Found</h3>
                <p className="text-sm">
                  Start managing your inventory by adding products and connecting your e-commerce platform.
                </p>
                <a href="/inventory/products" className="text-sm text-[#A17E25] hover:underline dark:text-[#D4AF37]">
                  Add Products
                </a>
              </div>
            ) : (
              <SalesDistribution data={{
                totalItems: inventoryData.totalProducts,
                lowStock: inventoryData.lowStockCount,
                pendingOrders: inventoryData.recentOrders.length
              }} />
            )}
          </div>
          {/* Audit Logs Section */}
          {logsLoading && !logsError && <Skeleton className="h-40 w-full rounded-lg bg-sidebar" />}
          {logsError || !auditLogs ? (
            <div className="bg-sidebar text-sidebar-foreground p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">No Audit Logs Found</h3>
              <p className="text-sm">
                Start tracking company activities by enabling audit logs.
              </p>
            </div>
          ) : (
            <ActivityFeed auditLogs={auditLogs} />
          )}

          {/* AI Insights Section */}
          {insightsLoading && !insightsError && <Skeleton className="h-40 w-full rounded-lg bg-sidebar" />}
          {insightsError || !insightsData ? (
            <div className="bg-sidebar text-sidebar-foreground p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold">No AI Insights Found</h3>
              <p className="text-sm">
                Start leveraging AI insights by enabling analytics for your company.
              </p>
            </div>
          ) : (
            <FinancialInsights />
          )}
        </div>
      </div>
    </div>
  );
}