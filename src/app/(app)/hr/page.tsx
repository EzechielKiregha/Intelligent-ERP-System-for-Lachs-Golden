import React from 'react'
import HRStatsCards from './_components/HRStatsCards'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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

      {/* Placeholder for charts & quick links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Future: PerformanceChart */}
        <div className="bg-sidebar rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-2 text-sidebar-foreground">Performance Trends</h2>
          <p className="text-sidebar-foreground">Coming soon…</p>
        </div>
        {/* Future: Recent Reviews */}
        <div className="bg-sidebar rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-2 text-sidebar-foreground">Recent Reviews</h2>
          <p className="text-sidebar-foreground">Coming soon…</p>
        </div>
      </div>
    </div>
  )
}
