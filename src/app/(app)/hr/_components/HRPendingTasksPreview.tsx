'use client';

import { useHRPendingTasksPreview } from '@/lib/hooks/hr';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { format } from 'date-fns';
import { RestrictedAccessModal } from './RestrictedAccessModal';

interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  assignee: { user: { id: string; firstName: string | null; lastName: string | null } } | null;
  project: { id: string; name: string } | null;
  workspace: { id: string; name: string } | null;
  createdAt: string;
}

export default function HRPendingTasksPreview() {
  const { data, isLoading } = useHRPendingTasksPreview();
  const { data: session } = useSession();
  const [restrictedTaskId, setRestrictedTaskId] = useState<string | null>(null);

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const handleTaskClick = (task: Task) => {
    if (task.assignee?.user.id && task.assignee.user.id !== session?.user.id) {
      setRestrictedTaskId(task.id);
      return false;
    }
    return true;
  };

  return (
    <Card className="bg-sidebar text-sidebar-foreground border-[var(--sidebar-border)]">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Pending Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {isLoading ? (
          Array(5)
            .fill(0)
            .map((_, i) => <Skeleton key={i} className="h-6 w-full rounded bg-muted" />)
        ) : data && data?.length ? (
          data.map((task) => (
            <>
              <Link
                key={task.id}
                href={`/workspaces/${task.workspace?.id}/tasks/${task.id}`}
                onClick={(e) => {
                  if (!handleTaskClick(task)) e.preventDefault();
                }}
                className="block"
              >
                <div
                  className={`flex flex-col p-2 rounded-md hover:bg-muted transition-colors ${isOverdue(task.dueDate) ? 'bg-red-100 dark:bg-red-900' : ''
                    }`}
                >
                  <span className="font-medium">{task.title}</span>
                  <span className="text-xs text-muted-foreground">
                    Assigned to: {task.assignee?.user.firstName} {task.assignee?.user.lastName} • Due:{' '}
                    {task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : 'N/A'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Project: {task.project?.name || 'N/A'} • Workspace: {task.workspace?.name || 'N/A'}
                  </span>
                </div>
              </Link>
            </>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No pending tasks found.</p>
        )}
      </CardContent>
      {restrictedTaskId && (
        <RestrictedAccessModal
          isOpen={!!restrictedTaskId}
          onClose={() => setRestrictedTaskId(null)}
        />
      )}
    </Card>
  );
}