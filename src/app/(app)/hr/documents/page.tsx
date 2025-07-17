'use client'
import React from 'react'
import DocumentFormPopover from '../_components/DocumentFormPopover'
import DocumentManager from '../_components/DocumentManager'

export default function DocumentsPage() {
  return (
    <div className="flex flex-col min-h-full">
      <div className="@container/main flex flex-1 flex-col gap-4">
        <h1 className="text-2xl font-semibold text-sidebar-foreground">Documents</h1>
        <DocumentFormPopover />
      </div>
      <DocumentManager />
    </div>
  )
}
