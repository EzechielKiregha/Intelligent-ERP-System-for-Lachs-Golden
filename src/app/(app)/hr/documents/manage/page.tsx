'use client'

import React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import DocumentFormPopover from '../../_components/DocumentFormPopover'

export default function ManageDocumentPage() {
  const params = useSearchParams()
  const id = params.get('id') || undefined
  const isEdit = Boolean(id)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/hr/documents" className="flex items-center gap-2 text-sidebar-primary hover:text-sidebar-accent">
          <ArrowLeft size={16} /> Back to Documents
        </Link>
        <h1 className="text-2xl font-semibold text-sidebar-foreground">
          {isEdit ? 'Edit Document' : 'Upload New Document'}
        </h1>
      </div>

      <p className="text-sm text-muted-foreground max-w-2xl">
        {isEdit
          ? 'Update details about this document. You can change its title, description, or reassign ownership.'
          : 'Upload and assign HR-related documents like contracts, certificates, or reports to employees.'}
      </p>

      <div className="bg-sidebar rounded-lg border-[var(--sidebar-border)] p-6">
        <DocumentFormPopover documentId={id} />
      </div>
    </div>
  )
}
