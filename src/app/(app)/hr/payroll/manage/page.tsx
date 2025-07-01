'use client'

import React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import PayrollFormPopover from '../../_components/PayrollFormPopover'
import { ArrowLeft } from 'lucide-react'

export default function ManagePayrollPage() {
  const params = useSearchParams()
  const id = params.get('id') || undefined
  const isEdit = Boolean(id)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/hr/payroll" className="flex items-center gap-2 text-sidebar-primary hover:text-sidebar-accent">
          <ArrowLeft size={16} /> Back to Payrolls
        </Link>
        <h1 className="text-2xl font-semibold text-sidebar-foreground">
          {isEdit ? 'Edit Payroll Record' : 'New Payroll Entry'}
        </h1>
      </div>

      <p className="text-sm text-muted-foreground max-w-2xl">
        {isEdit
          ? 'Update payroll information such as gross/net amounts, taxes, and employee details.'
          : 'Fill out the payroll details for an employee and specify the pay period.'}
      </p>

      <div className="bg-sidebar rounded-lg border-[var(--sidebar-border)] p-6">
        <PayrollFormPopover payrollId={id} />
      </div>
    </div>
  )
}
