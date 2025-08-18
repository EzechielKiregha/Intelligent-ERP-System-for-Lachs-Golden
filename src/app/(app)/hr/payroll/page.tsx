// app/hr/payroll/page.tsx
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import PayrollFormPopover from '../_components/PayrollFormPopover'
import PayrollTable from '../_components/PayrollTable'
import { useAuth } from 'contents/authContext'

export default function PayrollPage() {
  const user = useAuth().user
  const [hasAccess, setHasAccess] = useState(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'HR' || user?.role === 'ACCOUNTANT')

  return (
    <div className="flex flex-col min-h-full">
      <div className="@container/main flex flex-1 flex-col gap-4">
        <h1 className="text-2xl font-semibold text-sidebar-foreground">Payroll</h1>
        <div className="flex gap-2">
          {hasAccess && (
            <>
              <PayrollFormPopover />
              <Link href="/hr/payroll/manage">
                <Button className="bg-sidebar-primary hover:bg-sidebar-accent text-sidebar-primary-foreground">
                  Full Manage
                </Button>
              </Link>
            </>
          )}

        </div>
        <PayrollTable />
      </div>
    </div>
  )
}
