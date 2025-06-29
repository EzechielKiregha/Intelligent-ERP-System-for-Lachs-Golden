'use client'
import React from 'react'
import { format } from 'date-fns'
import { useReviews } from '@/lib/hooks/hr'

export default function ReviewTimeline() {
  const { data, isLoading } = useReviews()
  if (isLoading) return <p>Loading timeline…</p>
  return (
    <ul className="border-l-2 border-sidebar-accent">
      {data?.map((r) => (
        <li key={r.id} className="mb-4 ml-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-sidebar-primary rounded-full" />
            <time className="text-xs text-sidebar-foreground">
              {format(new Date(r.reviewDate), 'MMM d, yyyy')}
            </time>
          </div>
          <div className="mt-1 p-4 bg-sidebar rounded-lg shadow-sm">
            <h4 className="font-semibold text-sidebar-primary">{r.rating}</h4>
            <p className="text-sidebar-foreground">{r.comments}</p>
            {r.reviewer && <p className="text-xs text-sidebar-foreground mt-1">By {r.reviewer.name}</p>}
          </div>
        </li>
      ))}
    </ul>
  )
}
