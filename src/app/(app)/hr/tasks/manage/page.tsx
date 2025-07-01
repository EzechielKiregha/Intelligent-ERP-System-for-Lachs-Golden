'use client'

import React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import TaskFormPopover from '../../_components/TaskFormPopover'
import TaskForm from '../../_components/TaskForm'

export default function ManageTaskPage() {
  const params = useSearchParams()
  const id = params.get('id') || undefined
  const isEdit = Boolean(id)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/hr/tasks" className="flex items-center gap-2 text-sidebar-primary hover:text-sidebar-accent">
          <ArrowLeft size={16} /> Back to Tasks
        </Link>
        <h1 className="text-2xl font-semibold text-sidebar-foreground">
          {isEdit ? 'Edit Task' : 'Assign New Task'}
        </h1>
      </div>

      <p className="text-sm text-muted-foreground max-w-2xl">
        {isEdit
          ? 'You can update this task’s details such as title, description, deadline, or assignee.'
          : 'Create and assign a new task to an employee. Ideal for tracking onboarding, reviews, or HR admin actions.'}
      </p>

      <div className="bg-sidebar rounded-lg border-[var(--sidebar-border)] p-6">
        <TaskForm taskId={id} />
      </div>
    </div>
  )
}
