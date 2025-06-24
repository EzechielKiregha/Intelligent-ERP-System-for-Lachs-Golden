'use client';

import React from 'react';
import ExportReportButton from '../../finance/_components/ExportReportButton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import BudgetSection from '../_components/BudgetSection';
import CategoryForm from '../_components/CategoryForm';
import { Button } from '@/components/ui/button';

export default function BudgetPage() {
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
          {/* Reports Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Transactions Report */}
            <Card className="bg-sidebar shadow">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-sidebar-foreground">
                  Transactions Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Export a detailed report of all transactions, including orders, refunds, and payments. Use this report to track financial activity and ensure accuracy.
                </p>
                <ExportReportButton type="transactions" />
              </CardContent>
            </Card>

            {/* Revenue Report */}
            <Card className="bg-sidebar shadow">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-sidebar-foreground">
                  Revenue Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Generate a report summarizing your revenue over a selected period. Analyze trends and identify growth opportunities.
                </p>
                <ExportReportButton type="revenue" />
              </CardContent>
            </Card>

            {/* Expenses Report */}
            <Card className="bg-sidebar shadow">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-sidebar-foreground">
                  Expenses Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Export a comprehensive report of your expenses to monitor spending and manage budgets effectively.
                </p>
                <ExportReportButton type="expenses" />
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <CategoryForm />
        <BudgetSection />
      </div>
    </div>
  );
}
