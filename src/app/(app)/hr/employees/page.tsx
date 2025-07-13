// app/hr/employees/page.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import EmployeeFormPopover from '../_components/EmployeeFormPopover'
import EmployeeTable from '../_components/EmployeeTable'

export default function EmployeesPage() {
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-sidebar-foreground">Employees</h1>
        <div className="flex gap-2">
          <EmployeeFormPopover />
          <Link href="/hr/employees/manage">
            <Button className="hover:bg-sidebar-primary bg-sidebar-accent text-sidebar-primary-foreground">
              Full Manage
            </Button>
          </Link>
        </div>
      </div>

      {/* Employee Table */}
      <EmployeeTable />
    </div>
  )
}
