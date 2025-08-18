"use client"
import React, { useState } from 'react';
import ExportReportButton from '../../finance/_components/ExportReportButton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from 'contents/authContext';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const ReportsPage = () => {

  const user = useAuth().user
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'HR')

  return (
    <div className="p-2 space-y-6">
      {/* Page Header */}
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <Button variant='link' onClick={() => router.back()}
            className="flex items-center gap-2 text-sidebar-primary hover:text-sidebar-accent">
            <ArrowLeft size={16} /> Back
          </Button>
          <h1 className="text-3xl font-bold text-sidebar-foreground">Reports</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Gain insights into your business performance by exporting detailed reports for transactions, revenue, and expenses.
        </p>
      </header>

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
    </div>
  );
};

export default ReportsPage;