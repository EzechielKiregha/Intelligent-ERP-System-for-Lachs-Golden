'use client'

import React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import ManageEmployeeForm from '../_components/ManageEmployeeForm'
import { ArrowLeft } from 'lucide-react'

export default function ManageEmployeePage() {
  const params = useSearchParams()
  const id = params.get('id') || undefined
  const isEdit = Boolean(id)

  return (
    <div className="p-6 space-y-6">
      {/* Back link + Page title */}
      <div className="flex items-center justify-between">
        <Link href="/hr/employees" className="flex items-center gap-2 text-sidebar-primary hover:text-sidebar-accent">
          <ArrowLeft size={16} /> Back to Employees
        </Link>
        <h1 className="text-2xl font-semibold text-sidebar-foreground">
          {isEdit ? 'Edit Employee' : 'New Employee'}
        </h1>
      </div>

      {/* Context description */}
      <p className="text-sm text-muted-foreground max-w-2xl">
        {isEdit
          ? 'Update any of the fields below to modify this employee’s record. Changes will be saved immediately on submit.'
          : 'Fill out the form to create a new employee record. You can always edit details later from the employee list.'}
      </p>

      {/* The form */}
      <div className="bg-sidebar rounded-lg border-[var(--sidebar-border)] p-6">
        <ManageEmployeeForm employeeId={id} />
      </div>
    </div>
  )
}
