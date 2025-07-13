'use client'
import React from 'react'
import FinanceSummaryCards from './_components/FinanceSummaryCards';
import FinanceForecastSection from './_components/FinanceForecastSection';
import FinancialInsights from './_components/FinancialInsights';
import CategoriesList from './_components/CategoryList';
import { useFinanceTransactions } from '@/lib/hooks/finance';
import BudgetSection from './_components/BudgetSection';
import { useAuth } from 'contents/authContext';
import { useGetCompanyById } from '@/lib/hooks/use-owner-company';
import { getGreeting } from '@/lib/utils';

export default function FinancePage() {

  const currentUser = useAuth().user;
  const { data: company, isLoading: companyLoading, isError: companyError } = useGetCompanyById(currentUser?.currentCompanyId || '');

  return (
    <div className="flex flex-col min-h-full">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div>
          <h2 className="text-2xl font-semibold">
            {getGreeting()} {currentUser.name}
          </h2>
          <h3 className="text-lg text-muted-foreground">
            Welcome to &quot;{company?.name || 'Your Company'}&quot; Finance
          </h3>
        </div>
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