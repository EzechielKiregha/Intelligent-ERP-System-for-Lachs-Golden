import React from 'react'
import HRStatsCards from './_components/HRStatsCards'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import RecentEmployeesPreview from './_components/RecentEmployeesPreview'
import HRPendingTasksPreview from './_components/HRPendingTasksPreview'
import RecentReviewsFeed from './_components/RecentReviewsFeed'

export default function HRDashboardPage() {
  return (
    <div className="flex flex-col min-h-full">
      <div className="@container/main flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-4 py-4 md:gap-4 md:py-4">
          <h1 className="text-3xl font-semibold text-sidebar-foreground">HR Dashboard</h1>
          <div className="flex flex-wrap gap-2">
            <Link href="/hr/employees">
              <Button className="bg-sidebar-primary hover:bg-sidebar-accent cursor-pointer text-sidebar-accent-foreground">
                Manage Employees
              </Button>
            </Link>
            <Link href="/hr/departments">
              <Button className="bg-sidebar-primary hover:bg-sidebar-accent cursor-pointer text-sidebar-accent-foreground">
                Departments
              </Button>
            </Link>
            <Link href="/hr/payroll">
              <Button className="bg-sidebar-primary hover:bg-sidebar-accent cursor-pointer text-sidebar-accent-foreground">
                Payroll
              </Button>
            </Link>
            <Link href="/hr/reviews">
              <Button className="bg-sidebar-primary hover:bg-sidebar-accent cursor-pointer text-sidebar-accent-foreground">
                Performance Reviews
              </Button>
            </Link>
            <Link href="/hr/documents">
              <Button className="bg-sidebar-primary hover:bg-sidebar-accent cursor-pointer text-sidebar-accent-foreground">
                Documents
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
    </div>

  )
}
