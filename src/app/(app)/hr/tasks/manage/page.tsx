'use client'
import React from 'react'
import { useSearchParams } from 'next/navigation'
import TaskFormPopover from '../../_components/TaskFormPopover'

export default function ManageTaskPage() {
  const params = useSearchParams()
  const id = params.get('id') || undefined
  return <div className="p-6"><TaskFormPopover /></div>
}
