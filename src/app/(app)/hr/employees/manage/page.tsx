// app/hr/employees/manage/page.tsx
'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import ManageEmployeeForm from '../_components/ManageEmployeeForm'

export default function ManageEmployeePage() {
  const params = useSearchParams()
  const id = params.get('id') || undefined

  return (
    <div className="p-6">
      <ManageEmployeeForm employeeId={id} />
    </div>
  )
}
