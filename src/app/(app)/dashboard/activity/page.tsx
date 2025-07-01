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

  const { data: auditLogs, isLoading: logsLoading } = useAuditLog()

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-sidebar-foreground">Activity Feed</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real time activity feed updated of your business actions and performance, very detailed transactions, revenue, and expenses.
        </p>
      </header>
      {logsLoading && <Skeleton className="h-40 w-full rounded-lg bg-sidebar" />}
      {!logsLoading && (
        <Card className="bg-sidebar shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">

            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {auditLogs.length === 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">No recent activity found.</p>
            ) : (
              <ul className="space-y-2">
                {auditLogs && auditLogs.map((log: any) => (
                  <li key={log.id} className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{log.action}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {log.entity} (ID: {log.entityId})
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