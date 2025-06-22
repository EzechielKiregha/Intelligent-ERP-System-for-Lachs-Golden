'use client'
import React from 'react';
import { MetricCard } from './MetricCard';
import { useFinanceSummaryPeriod } from '@/lib/hooks/finance';
import { Skeleton } from '@/components/ui/skeleton';

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map(i => (
          <Skeleton key={i} className="h-40 w-full rounded-lg" />
        ))}
      </div>
    );
  }
  if (isError || !data) {
    return <p className="text-red-600">Failed to load summary.</p>;
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 py-3 lg:px-6">
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
