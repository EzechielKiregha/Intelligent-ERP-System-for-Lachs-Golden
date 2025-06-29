// app/hr/departments/manage/page.tsx
'use client'
import React from 'react'
import { useSearchParams } from 'next/navigation'
import DepartmentFormPopover from '../../_components/DepartmentFormPopover'

export default function ManageDeptPage() {
  const params = useSearchParams()
  const id = params.get('id') || undefined

  return (
    <div className="p-6">
      <DepartmentFormPopover />
    </div>
  )
}
