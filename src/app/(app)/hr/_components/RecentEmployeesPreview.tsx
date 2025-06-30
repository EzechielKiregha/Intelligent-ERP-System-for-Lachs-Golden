'use client'

import { useHREmployeesPreview } from '@/lib/hooks/hr'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function RecentEmployeesPreview() {
  const { data, isLoading } = useHREmployeesPreview()

  return (
    <Card className="bg-sidebar text-sidebar-foreground border-[var(--sidebar-border)]">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Employees</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-6 w-full rounded bg-muted" />)
        ) : (
          data?.map(emp => (
            <div key={emp.id} className="flex flex-col">
              <span className="font-medium">{emp.firstName} {emp.lastName}</span>
              <span className="text-xs text-muted-foreground">
                {emp.jobTitle ?? 'No title'} • {emp.department?.name ?? 'No dept'}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
