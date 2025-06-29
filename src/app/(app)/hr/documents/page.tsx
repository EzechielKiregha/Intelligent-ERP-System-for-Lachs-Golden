'use client'
import React from 'react'
import DocumentFormPopover from '../_components/DocumentFormPopover'
import DocumentManager from '../_components/DocumentManager'

export default function DocumentsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-sidebar-foreground">Documents</h1>
        <DocumentFormPopover />
      </div>
      <DocumentManager />
    </div>
  )
}
