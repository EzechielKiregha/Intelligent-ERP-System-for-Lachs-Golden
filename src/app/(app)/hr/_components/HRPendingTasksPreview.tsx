'use client'

import { useHRPendingTasksPreview } from '@/lib/hooks/hr'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function HRPendingTasksPreview() {
  const { data, isLoading } = useHRPendingTasksPreview()

  return (
    <Card className="bg-sidebar text-sidebar-foreground border-[var(--sidebar-border)]">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Pending Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-6 w-full rounded bg-muted" />)
        ) : (
          data?.map(task => (
            <div key={task.id} className="flex flex-col">
              <span className="font-medium">{task.title}</span>
              <span className="text-xs text-muted-foreground">
                {task.assignee?.firstName} {task.assignee?.lastName} • Due: {task.dueDate?.slice(0, 10) ?? 'N/A'}
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
