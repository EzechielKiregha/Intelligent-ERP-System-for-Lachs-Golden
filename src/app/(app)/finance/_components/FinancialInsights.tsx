'use client'
import React from 'react'
import { useFinanceInsights } from '@/lib/hooks/finance'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function FinancialInsights() {
  const { data: insights, isLoading, isError } = useFinanceInsights()

  if (isLoading) return <p>Loading insights...</p>
  if (isError) return <p>Error loading insights.</p>
  if (!insights || insights.length === 0) return <p>No insights at this time.</p>

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
  )
}
