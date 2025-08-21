'use client';

import React, { useState } from 'react';
import ExportReportButton from '../../finance/_components/ExportReportButton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import BudgetSection from '../_components/BudgetSection';
import CategoryForm from '../_components/CategoryForm';
import { useSearchParams } from 'next/navigation';
import { useAuth } from 'contents/authContext';

export default function BudgetPage() {

  const searchParams = useSearchParams();
  const catId = searchParams.get('catId')
  const user = useAuth().user
  const [hasAccess, setHasAccess] = useState(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'HR' || user?.role === 'ACCOUNTANT')


  return (
    <div className="p-6 space-y-8">
      {/* Header Card */}
      <Card className="bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border border-sidebar-border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Financial Overview & Budget Planning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Welcome to your finance dashboard. Use this page to set category budgets and visualize your company’s financial allocation in real-time.
          </p>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm text-gray-800 dark:text-gray-300 max-w-2xl">
              Set monthly or annual budgets for income and expenses. Track usage as it happens and export detailed reports to keep your team aligned.
            </p>

          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">

        {hasAccess && (
          <>
            <CategoryForm id={catId} />
            <BudgetSection />
          </>
        )}
      </div>
    </div>
  );
}
