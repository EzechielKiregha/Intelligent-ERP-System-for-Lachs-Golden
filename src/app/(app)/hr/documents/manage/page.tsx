'use client'
import React from 'react'
import { useSearchParams } from 'next/navigation'
import DocumentFormPopover from '../../_components/DocumentFormPopover'

export default function ManageDocumentPage() {
  const params = useSearchParams()
  const id = params.get('id') || undefined
  return <div className="p-6"><DocumentFormPopover /></div>
}
