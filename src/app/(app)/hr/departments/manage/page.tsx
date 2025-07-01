'use client'

import React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import DepartmentForm from '../../_components/DepartmentForm'

export default function ManageDepartmentPage() {
  const params = useSearchParams()
  const id = params.get('id') || undefined
  const isEdit = Boolean(id)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/hr/departments" className="flex items-center gap-2 text-sidebar-primary hover:text-sidebar-accent">
          <ArrowLeft size={16} /> Back to Departments
        </Link>
        <h1 className="text-2xl font-semibold text-sidebar-foreground">
          {isEdit ? 'Edit Department' : 'New Department'}
        </h1>
      </div>

      <p className="text-sm text-muted-foreground max-w-2xl">
        {isEdit
          ? 'Update the department name or associated company for this entry.'
          : 'Create a new department and assign it to a company.'}
      </p>

      <div className="bg-sidebar rounded-lg border-[var(--sidebar-border)] p-6">
        <DepartmentForm departmentId={id} />
      </div>
    </div>
  )
}
