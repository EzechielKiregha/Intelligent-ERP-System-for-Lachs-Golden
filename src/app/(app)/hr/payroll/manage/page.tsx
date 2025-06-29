// app/hr/payroll/manage/page.tsx
'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import PayrollFormPopover from '../../_components/PayrollFormPopover'

export default function ManagePayrollPage() {
  const params = useSearchParams()
  const id = params.get('id') || undefined

  return (
    <div className="p-6">
      <PayrollFormPopover />
    </div>
  )
}
