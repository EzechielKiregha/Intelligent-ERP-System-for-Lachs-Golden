'use client'
import React from 'react';
import { MetricCard } from '../../_components/MetricCard';
import { useFinanceSummaryPeriod } from '@/lib/hooks/finance';
import { Skeleton } from '@/components/ui/skeleton';
import SkeletonLoader from '../../_components/SkeletonLoader';
import Link from 'next/link';

export default function FinanceSummaryCards() {
  // You can allow user to choose period; for now default to 'month'
  const period: 'month' = 'month'
  const { data, isLoading, isError } = useFinanceSummaryPeriod(period);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);

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
        <h3 className="text-lg font-semibold">No Finance Data Found</h3>
        <p className="text-sm">
          Start managing your finances by adding transactions, budgets, and forecasts.
        </p>
        <div className="mt-4 space-y-2 flex flex-row justify-between items-start">
          <Link href="/finance/transactions" className="text-sm text-[#A17E25] hover:underline dark:text-[#D4AF37]">
            Add Transactions
          </Link>
          <Link href="/finance/budget" className="text-sm text-[#A17E25] hover:underline dark:text-[#D4AF37]">
            Setup Budget
          </Link>
          <Link href="/finance/forecast" className="text-sm text-[#A17E25] hover:underline dark:text-[#D4AF37]">
            Create Forecasts
          </Link>
        </div>
      </div>
    );
  }

  // Compute percent changes
  const revenueChange = data.prevRevenue
    ? ((data.totalRevenue - data.prevRevenue) / data.prevRevenue) * 100
    : undefined;
  const expensesChange = data.prevExpenses
    ? ((data.totalExpenses - data.prevExpenses) / data.prevExpenses) * 100
    : undefined;
  const netChange = data.prevNetProfit
    ? ((data.netProfit - data.prevNetProfit) / Math.abs(data.prevNetProfit)) * 100
    : undefined;

  // Footer messages
  const revFooter = `Compared to previous ${data.period}`;
  const expFooter = `Compared to previous ${data.period}`;
  const netFooter = `Compared to previous ${data.period}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
      <MetricCard
        description="Total Revenue"
        value={data.totalRevenue}
        formatValue={formatCurrency}
        percentChange={revenueChange}
        footerMessage={revFooter}
        footerSubtext={`Period: ${data.ranges.currStart.slice(0, 10)} to ${data.ranges.currEnd.slice(0, 10)}`}
      />
      <MetricCard
        description="Total Expenses"
        value={data.totalExpenses}
        formatValue={formatCurrency}
        percentChange={expensesChange}
        footerMessage={expFooter}
        footerSubtext={`Period: ${data.ranges.currStart.slice(0, 10)} to ${data.ranges.currEnd.slice(0, 10)}`}
      />
      <MetricCard
        description="Net Profit"
        value={data.netProfit}
        formatValue={formatCurrency}
        percentChange={netChange}
        footerMessage={netFooter}
        footerSubtext={`Period: ${data.ranges.currStart.slice(0, 10)} to ${data.ranges.currEnd.slice(0, 10)}`}
      />

    </div>
  );
}
