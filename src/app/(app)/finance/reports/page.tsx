// app/(dashboard)/finance/reports/page.tsx
"use client"

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from 'contents/authContext';
import ExportReportButton from '../_components/ExportReportButton';

const FinanceReportsPage = () => {
  const user = useAuth().user;
  const router = useRouter();

  // Check if user has permission to access finance reports
  const hasAccess = user?.role === 'ADMIN' ||
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'ACCOUNTANT' ||
    user?.role === 'CEO' ||
    user?.role === 'MANAGER';

  if (!hasAccess) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Button
          variant='link'
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sidebar-primary hover:text-sidebar-accent mb-4"
        >
          <ArrowLeft size={16} /> Back
        </Button>

        <Card className="bg-sidebar border-[var(--sidebar-border)]">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-sidebar-foreground mb-4">
              Finance Reports Access
            </h2>
            <p className="text-sidebar-foreground/70 mb-6 max-w-2xl mx-auto">
              You don't have permission to view financial reports. Financial reports contain sensitive information
              and are restricted to authorized personnel only.
            </p>
            <div className="bg-sidebar-accent/10 border border-sidebar-accent/20 rounded p-4 text-left max-w-md mx-auto">
              <p className="font-medium text-sidebar-foreground mb-2">Available to:</p>
              <ul className="list-disc list-inside text-sidebar-foreground/70 space-y-1">
                <li>Administrators</li>
                <li>Accounting Department</li>
                <li>Executives (CEO, CFO)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <Button
            variant='link'
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sidebar-primary hover:text-sidebar-accent"
          >
            <ArrowLeft size={16} /> Back
          </Button>
          <h1 className="text-2xl font-bold text-sidebar-foreground">Financial Reports</h1>
        </div>
        <p className="text-sidebar-foreground/70">
          Generate financial reports to analyze revenue, expenses, and transaction data.
        </p>
      </header>

      {/* Financial Reports Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-sidebar border-[var(--sidebar-border)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-sidebar-foreground">
              Financial Summary Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-sidebar-foreground/70">
              Export a comprehensive summary of your financial performance including revenue and expenses.
            </p>
            <ExportReportButton
              type="financial-summary"
              label="Generate Summary"
            />
          </CardContent>
        </Card>

        <Card className="bg-sidebar border-[var(--sidebar-border)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-sidebar-foreground">
              Transaction Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-sidebar-foreground/70">
              Generate a detailed report of all transactions with filtering by date and category.
            </p>
            <ExportReportButton
              type="transaction-summary"
              label="Generate Transactions"
            />
          </CardContent>
        </Card>

        <Card className="bg-sidebar border-[var(--sidebar-border)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-sidebar-foreground">
              Expense Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-sidebar-foreground/70">
              Export a detailed breakdown of expenses by category and department.
            </p>
            <ExportReportButton
              type="expense-report"
              label="Generate Expenses"
            />
          </CardContent>
        </Card>

        <Card className="bg-sidebar border-[var(--sidebar-border)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-sidebar-foreground">
              Income Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-sidebar-foreground/70">
              Generate a comprehensive report of all income sources and revenue streams.
            </p>
            <ExportReportButton
              type="income-report"
              label="Generate Income"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinanceReportsPage;