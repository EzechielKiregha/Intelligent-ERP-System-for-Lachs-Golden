'use client'
import React from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

import AuthGuard from '../_components/AuthGuard'
import FinanceSummaryCards from './_components/FinanceSummaryCards';
import FinanceForecastSection from './_components/FinanceForecastSection';
import FinancialInsights from './_components/FinancialInsights';
import { TransactionList } from './_components/TransactionTable';
import CategoriesList from './_components/CategoryList';
import ExportReportButton from './_components/ExportReportButton';
import { useFinanceTransactions } from '@/lib/hooks/finance';
import BudgetSection from './_components/BudgetSection';

export default function FinancePage() {

  const { data: transactions, isLoading, error } = useFinanceTransactions();

  return (
    <AuthGuard>
      <div className="flex flex-col">

        <main className="p-4 space-y-6">
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
        </main>


      </div>
    </AuthGuard>
  );
}