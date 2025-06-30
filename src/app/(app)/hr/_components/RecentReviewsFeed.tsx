'use client'

import { useHRRecentReviewsPreview } from '@/lib/hooks/hr'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function RecentReviewsFeed() {
  const { data, isLoading } = useHRRecentReviewsPreview()

  return (
    <Card className="bg-sidebar text-sidebar-foreground border-[var(--sidebar-border)]">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Reviews</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-6 w-full rounded bg-muted" />)
        ) : (
          data?.map(r => (
            <div key={r.id} className="flex flex-col">
              <span className="font-medium">
                {r.employee.firstName} {r.employee.lastName}
              </span>
              <span className="text-xs text-muted-foreground">
                Rated {r.rating} • {r.reviewer?.name ?? 'Anonymous'}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
