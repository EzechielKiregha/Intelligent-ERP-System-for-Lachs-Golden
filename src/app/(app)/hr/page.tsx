"use client"
import React from 'react'
import HRStatsCards from './_components/HRStatsCards'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import RecentEmployeesPreview from './_components/RecentEmployeesPreview'
import HRPendingTasksPreview from './_components/HRPendingTasksPreview'
import RecentReviewsFeed from './_components/RecentReviewsFeed'
import { getGreeting } from '@/lib/utils'
import { useAuth } from 'contents/authContext'
import { useGetCompanyById } from '@/lib/hooks/use-owner-company'

export default function HRDashboardPage() {

  const currentUser = useAuth().user;
  const { data: company, isLoading: companyLoading, isError: companyError } = useGetCompanyById(currentUser?.currentCompanyId || '');


  return (
    <div className="flex flex-col min-h-full">
      <div className="@container/main flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-4 py-4 md:gap-4 md:py-4">
          <div>
            <h2 className="text-2xl font-semibold">
              {getGreeting()} {currentUser.name}
            </h2>
            <h3 className="text-lg text-muted-foreground">
              Welcome to &quot;{company?.name || 'Your Company'}&quot; HR Dashboard
            </h3>
          </div>
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
