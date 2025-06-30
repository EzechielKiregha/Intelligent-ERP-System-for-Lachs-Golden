import React from 'react'
import HRStatsCards from './_components/HRStatsCards'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import RecentEmployeesPreview from './_components/RecentEmployeesPreview'
import HRPendingTasksPreview from './_components/HRPendingTasksPreview'
import RecentReviewsFeed from './_components/RecentReviewsFeed'

export default function HRDashboardPage() {
  return (
    <div className="p-6 space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-semibold text-sidebar-foreground">HR Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Link href="/hr/employees">
            <Button className="bg-sidebar-primary hover:bg-sidebar-accent">
              Manage Employees
            </Button>
          </Link>
          <Link href="/hr/departments">
            <Button className="bg-sidebar-primary hover:bg-sidebar-accent">
              Departments
            </Button>
          </Link>
          <Link href="/hr/payroll">
            <Button className="bg-sidebar-primary hover:bg-sidebar-accent">
              Payroll
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary c  */}
      <HRStatsCards />

      {/* Grid layout for previews */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <RecentEmployeesPreview />
        <HRPendingTasksPreview />
        <RecentReviewsFeed />
      </div>
    </div>
  )
}
