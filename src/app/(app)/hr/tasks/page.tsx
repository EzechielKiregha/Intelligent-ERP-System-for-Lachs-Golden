'use client'
import React from 'react'
import TaskFormPopover from '../_components/TaskFormPopover'
import TaskList from '../_components/TaskList'

export default function TasksPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-sidebar-foreground">Tasks</h1>
        <TaskFormPopover />
      </div>
      <TaskList />
    </div>
  )
}
