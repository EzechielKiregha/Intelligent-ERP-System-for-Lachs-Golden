'use client'
import React from 'react'
import ReviewFormPopover from '../_components/ReviewFormPopover'
import ReviewTable from '../_components/ReviewTable'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ReviewsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-sidebar-foreground">Performance Reviews</h1>
        <ReviewFormPopover />
        <Link href="/hr/reviews/manage">
          <Button className="hover:bg-sidebar-primary bg-sidebar-accent text-sidebar-primary-foreground">
            Full Manage
          </Button>
        </Link>
      </div>
      <ReviewTable />
    </div>
  )
}
