import { useBudgetData } from '@/lib/hooks/finance';
import React from 'react';
import Link from 'next/link';
import SkeletonLoader from '../../_components/SkeletonLoader';

interface BudgetCategory {
  id: string;
  name: string;
  budgetLimit: number;
  budgetUsed: number;
  remainingBudget: number;
}

export default function BudgetSection() {
  const { data, isLoading, isError } = useBudgetData();

  if (isLoading) {
    return <SkeletonLoader height={72} type="card" count={1} />;
  }

  if (isError || !data || data.length === 0) {
    return (
      <div className="bg-sidebar text-sidebar-foreground p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold">No Budget Data Found</h3>
        <p className="text-sm">
          Start managing your company&apos;s budget by creating categories and setting limits.
        </p>
        <div className="mt-4 space-y-2 flex flex-row justify-between items-start">
          <Link href="/finance/budget" className="text-sm text-[#A17E25] hover:underline dark:text-[#D4AF37]">
            Setup Budget
          </Link>
          <Link href="/finance/categories" className="text-sm text-[#A17E25] hover:underline dark:text-[#D4AF37]">
            Manage Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border border-sidebar-border rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Budget Allocation</h3>
      <ul className="space-y-4">
        {data.map((category: BudgetCategory) => (
          <li key={category.id} className="flex items-center justify-between">
            {/* Category Name */}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{category.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {category.budgetUsed} / {category.budgetLimit} used
              </p>
            </div>

            {/* Progress Bar */}
            <div className="flex-1 mx-4">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="h-4 rounded-full"
                  style={{
                    width: `${(category.budgetUsed / category.budgetLimit) * 100}%`,
                    backgroundColor: category.budgetUsed / category.budgetLimit > 0.8 ? '#A17E25' : '#D4AF37',
                  }}
                ></div>
              </div>
            </div>

            {/* Remaining Budget */}
            <div className="text-sm text-gray-800 dark:text-gray-200">
              Remaining: ${category.remainingBudget.toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}