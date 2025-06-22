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
      <div className="flex flex-col bg-sidebar">

        <main className="p-6 space-y-6">
          {/* Finance Cards */}
          <div className='"grid grid-rows-1 lg:grid-rows-2 gap-6 mb-6"'>
            <FinanceSummaryCards />
            <FinanceForecastSection />
          </div>

          {/* Forecast Chart & Budget Section */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">


          </section>

          {/* Transaction List */}
          <section>
            <TransactionList data={transactions || []} />
          </section>

          {/* Financial Insights */}
          <section>
            <FinancialInsights />
            <BudgetSection />
          </section>
        </main>


      </div>
    </AuthGuard>
  );
}