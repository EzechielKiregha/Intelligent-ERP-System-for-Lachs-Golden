'use client'
import React, { useState } from 'react'
import ReviewFormPopover from '../_components/ReviewFormPopover'
import ReviewTable from '../_components/ReviewTable'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from 'contents/authContext'

export default function ReviewsPage() {
  const user = useAuth().user
  const [hasAccess, setHasAccess] = useState(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'HR')

  return (
    <div className="flex flex-col min-h-full">
      <div className="@container/main flex flex-1 flex-col gap-4">
        <h1 className="text-2xl font-semibold text-sidebar-foreground">Performance Reviews</h1>
        <div className="flex gap-2">
          {hasAccess && (
            <>
              <ReviewFormPopover />
              <Link href="/hr/reviews/manage">
                <Button className="hover:bg-sidebar-primary bg-sidebar-accent text-sidebar-primary-foreground">
                  Full Manage
                </Button>
              </Link>
            </>
          )}
        </div>

      </div>
      <ReviewTable />
    </div>
  )
}
