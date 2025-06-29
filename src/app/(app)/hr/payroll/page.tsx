// app/hr/payroll/page.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import PayrollFormPopover from '../_components/PayrollFormPopover'
import PayrollTable from '../_components/PayrollTable'

export default function PayrollPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-sidebar-foreground">Payroll</h1>
        <div className="flex gap-2">
          <PayrollFormPopover />
          <Link href="/hr/payroll/manage">
            <Button className="bg-sidebar-primary hover:bg-sidebar-accent text-sidebar-primary-foreground">
              Full Manage
            </Button>
          </Link>
        </div>
      </div>
      <PayrollTable />
    </div>
  )
}
