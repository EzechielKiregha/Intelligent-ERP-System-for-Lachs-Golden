'use client'

import React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import ReviewFormPopover from '../../_components/ReviewFormPopover'
import ReviewForm from '../../_components/ReviewForm'

export default function ManageReviewPage() {
  const params = useSearchParams()
  const id = params.get('id') || undefined
  const isEdit = Boolean(id)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/hr/reviews" className="flex items-center gap-2 text-sidebar-primary hover:text-sidebar-accent">
          <ArrowLeft size={16} /> Back to Reviews
        </Link>
        <h1 className="text-2xl font-semibold text-sidebar-foreground">
          {isEdit ? 'Edit Review' : 'New Performance Review'}
        </h1>
      </div>

      <p className="text-sm text-muted-foreground max-w-2xl">
        {isEdit
          ? 'You can update the performance rating, comments, and reviewer details for this review.'
          : 'Create a performance review for an employee based on evaluation period and observations.'}
      </p>

      <div className="bg-sidebar rounded-lg border-[var(--sidebar-border)] p-6">
        <ReviewForm reviewId={id} />
      </div>
    </div>
  )
}
