'use client';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useHRSummary } from '@/lib/hooks/hr';
import { MetricCard } from '../../_components/MetricCard';
import Link from 'next/link';

export default function HRStatsCards() {
  const { data, isLoading, isError } = useHRSummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg bg-sidebar" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-sidebar text-sidebar-foreground p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold">No HR Data Found</h3>
        <p className="text-sm">
          Start managing your HR records by adding employees, departments, and payroll information.
        </p>
        <div className="mt-4  space-y-2 flex flex-row justify-between items-start">
          <Link href="/hr/employees" className="text-sm text-[#A17E25] hover:underline dark:text-[#D4AF37]">
            Add Employees
          </Link>
          <Link href="/hr/departments" className="text-sm text-[#A17E25] hover:underline dark:text-[#D4AF37]">
            Create Departments
          </Link>
          <Link href="/hr/payroll" className="text-sm text-[#A17E25] hover:underline dark:text-[#D4AF37]">
            Setup Payroll
          </Link>
        </div>
      </div>
    );
  }

  const { totalEmployees, departmentCount, pendingTasks, documentCount, totalPayrollThisMonth } = data;

  const formatNumber = (v: number) => v.toLocaleString();
  const formatCurrency = (v: number) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(v);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
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
        value={totalPayrollThisMonth}
        formatValue={formatCurrency}
        footerMessage="Net paid"
      />
    </div>
  );
}
