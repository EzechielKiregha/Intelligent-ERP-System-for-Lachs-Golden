import React from 'react';
import { useAuditLog } from '@/lib/hooks/dashboard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useNavigation } from '@/hooks/use-navigation';
import { Button } from '@/components/ui/button';

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

const ActivityFeed = ({
  auditLogs
}: AuditLog) => {

  const nav = useNavigation()

  return (
    <Card className="bg-sidebar shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {auditLogs.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">No recent activity found.</p>
        ) : (
          <><ul className="space-y-2">
            {auditLogs && auditLogs.slice(0, 5).map((log) => (
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
            <Button variant="link" onClick={() => nav('/dashboard/activity')}>
              More
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;