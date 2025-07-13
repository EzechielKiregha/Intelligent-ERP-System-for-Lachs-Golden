'use client';
import React from 'react';
import { useFinanceInsights } from '@/lib/hooks/finance';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function FinancialInsights() {
  const { data: insights, isLoading, isError } = useFinanceInsights();

  if (isLoading) return <Skeleton className="h-40 w-full rounded-lg bg-sidebar" />;
  if (isError || !insights || insights.length === 0) {
    return (
      <div className="bg-sidebar text-sidebar-foreground p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold">No Financial Insights Found</h3>
        <p className="text-sm">
          Start leveraging financial insights by adding transactions and enabling analytics.
        </p>
        <div className="mt-4 space-y-2 flex flex-row justify-between items-start">
          <Link href="/finance/transactions" className="text-sm text-[#A17E25] hover:underline dark:text-[#D4AF37]">
            Add Transactions
          </Link>
          <Link href="/finance/analytics" className="text-sm text-[#A17E25] hover:underline dark:text-[#D4AF37]">
            Enable Analytics
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-sidebar text-sidebar-foreground dark:text-sidebar-foreground">
      <CardHeader>
        <CardTitle>Financial Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {insights.map((msg, idx) => (
          <div key={idx} className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <p>{msg}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

