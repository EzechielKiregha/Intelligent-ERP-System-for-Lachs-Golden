"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import DepartmentFormPopover from '../_components/DepartmentFormPopover'
import DepartmentTable from '../_components/DepartmentTable'
import { useAuth } from 'contents/authContext'

export default function DepartmentsPage() {
  const user = useAuth().user
  const [hasAccess, setHasAccess] = useState(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'HR')

  return (
    <div className="flex flex-col min-h-full">
      <div className="@container/main flex flex-1 flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-2xl font-semibold text-sidebar-foreground">Departments</h1>
          <div className="flex gap-2">
            {hasAccess && (
              <>
                <DepartmentFormPopover />

                <Link href="/hr/departments/manage">
                  <Button className="hover:bg-sidebar-primary bg-sidebar-accent text-sidebar-primary-foreground">
                    Full Manage
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
        <DepartmentTable />
      </div>
    </div>
  )
}
