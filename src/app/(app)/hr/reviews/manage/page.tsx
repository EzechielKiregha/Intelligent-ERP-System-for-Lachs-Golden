'use client'
import React from 'react'
import { useSearchParams } from 'next/navigation'
import ReviewFormPopover from '../../_components/ReviewFormPopover'

export default function ManageReviewPage() {
  const params = useSearchParams()
  const id = params.get('id') || undefined
  return <div className="p-6"><ReviewFormPopover /></div>
}
