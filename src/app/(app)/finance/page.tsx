'use client'
import React from 'react'
import FinanceSummaryCards from './_components/FinanceSummaryCards';
import FinanceForecastSection from './_components/FinanceForecastSection';
import FinancialInsights from './_components/FinancialInsights';
import CategoriesList from './_components/CategoryList';
import { useFinanceTransactions } from '@/lib/hooks/finance';
import BudgetSection from './_components/BudgetSection';

export default function FinancePage() {

  return (
    <div className="flex flex-col min-h-full">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Finance Cards */}
          <section>
            <FinanceSummaryCards />
          </section>

          {/* Forecast Chart & Budget Section */}
          <section>
            <FinanceForecastSection />
          </section>

          {/* Transaction List */}
          <section>
            <CategoriesList />
          </section>

          {/* Financial Insights */}
          <section className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <FinancialInsights />
            <BudgetSection />
          </section>
        </div>
      </div>
    </div>
  );
}