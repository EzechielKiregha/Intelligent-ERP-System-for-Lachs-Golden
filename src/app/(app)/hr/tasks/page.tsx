'use client'
import React from 'react'
import TaskFormPopover from '../_components/TaskFormPopover'
import TaskList from '../_components/TaskList'

export default function TasksPage() {
  return (
    <div className="flex flex-col min-h-full">
      <div className="@container/main flex flex-1 flex-col gap-4">
        <h1 className="text-2xl font-semibold text-sidebar-foreground">Tasks</h1>
        <TaskFormPopover />
      </div>
      <TaskList />
    </div>
  )
}
