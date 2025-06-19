import React from 'react';
import FinanceCard from './FinanceCard';
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { useFinanceSummary } from '@/lib/hooks/finance';

export default function FinanceCards() {
  const { data, isLoading, isError } = useFinanceSummary();

  if (isLoading) {
    return <p>Loading finance summary...</p>;
  }

  if (isError) {
    return <p>Error loading finance summary.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <FinanceCard
        icon={<DollarSign className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />}
        label="Total Revenue"
        value={`$${data.totalRevenue.toLocaleString()}`}
        delta={`${data.revenueChange > 0 ? '+' : ''}${data.revenueChange}%`}
        deltaType={data.revenueChange >= 0 ? 'increase' : 'decrease'}
        tooltip="vs last month"
      />
      <FinanceCard
        icon={<TrendingDown className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />}
        label="Total Expenses"
        value={`$${data.totalExpenses.toLocaleString()}`}
        delta={`${data.expenseChange > 0 ? '+' : ''}${data.expenseChange}%`}
        deltaType={data.expenseChange >= 0 ? 'increase' : 'decrease'}
        tooltip="vs last month"
      />
      <FinanceCard
        icon={<TrendingUp className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />}
        label="Net Profit"
        value={`$${data.netProfit.toLocaleString()}`}
        delta={`${data.profitChange > 0 ? '+' : ''}${data.profitChange}%`}
        deltaType={data.profitChange >= 0 ? 'increase' : 'decrease'}
        tooltip="vs last month"
      />
      <FinanceCard
        icon={<DollarSign className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />}
        label="Budget Usage"
        value={`${data.budgetUsage}%`}
        tooltip="Marketing: 70%, Development: 45%"
      />
    </div>
  );
}