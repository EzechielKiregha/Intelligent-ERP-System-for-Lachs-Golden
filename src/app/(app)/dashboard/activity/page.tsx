"use client"
import React from 'react';
import { useAuditLog } from '@/lib/hooks/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface AuditLog {
  auditLogs: {
    id: number;
    action: string;
    entityId: string;
    entity: string;
    description: string;
    timestamp: string;
    url: string;
  }[];

}

const ActivityFeed = () => {

  const { data: auditLogs, isLoading: logsLoading, error } = useAuditLog()

  if (logsLoading) {
    return <Skeleton className="h-40 w-full rounded-lg bg-sidebar" />;
  }

  if (error || !auditLogs) {
    return (
      <div className="bg-sidebar text-sidebar-foreground p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold">No Audit Logs Found</h3>
        <p className="text-sm">
          Start tracking company activities by enabling audit logs.
        </p>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-6">
      {/* Page Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-sidebar-foreground">Activity Feed</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real time activity feed updated of your business actions and performance, very detailed transactions, revenue, and expenses.
        </p>
      </header>
      {!logsLoading && (
        <Card className="bg-sidebar shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-sidebar-foreground">Recent Activities</CardTitle>
          </CardHeader>
          {/* Activity List */}
          <CardContent className="space-y-4">
            {auditLogs.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">No recent activity found.</p>
            ) : (
              <ul className="space-y-2">
                {auditLogs && auditLogs.map((log: any) => (
                  <li key={log.id} className="flex justify-between items-center border-b border-s-amber-200">
                    <div>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{log.action}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {log.entity}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{log.timestamp}</p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{log.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ActivityFeed;