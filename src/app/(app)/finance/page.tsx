'use client';

import React from 'react';
import FinanceCards from './_components/FinanceCards';
import TransactionList from './_components/TransactionList';
import ForecastChart from './_components/ForecastChart';
import BudgetSection from './_components/BudgetSection';
import FinancialInsights from './_components/FinancialInsights';
import FilterToolbar from './_components/FilterToolbar';
import SkeletonLoader from '../_components/SkeletonLoader';
import {
  useFinanceForecast,
  useFinanceInsights,
  useFinanceTransactions
} from '@/lib/hooks/finance'; // Custom hook to fetch finance data
import AuthGuard from '../_components/AuthGuard';

export default function FinancePage() {

  const { data: forecastData, isLoading: forecastLoading, isError: forecastError } = useFinanceForecast();
  const { data: insightsData, isLoading: insightsLoading, isError: insightsError } = useFinanceInsights();
  const { data: transactionsData, isLoading: transactionsLoading, isError: transactionsError } = useFinanceTransactions();

  const loading = forecastLoading || insightsLoading || transactionsLoading;


  return (
    <AuthGuard>
      <div className="flex flex-col bg-white dark:bg-[#111827] min-h-screen">
        {loading && <SkeletonLoader type="card" count={4} />}

        {/* Filter Toolbar */}
        <section className="p-6">
          <FilterToolbar />
        </section>

        {/* Main Content */}
        <main className="p-6 space-y-6">
          {/* Finance Cards */}
          <section>
            <FinanceCards />
          </section>

          {/* Forecast Chart & Budget Section */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ForecastChart />
            <BudgetSection />
          </section>

          {/* Transaction List */}
          <section>
            <TransactionList />
          </section>

          {/* Financial Insights */}
          <section>
            <FinancialInsights />
          </section>
        </main>
      </div>
    </AuthGuard>
  );
}