// app/settings/components/AdminSettings.tsx
'use client';

import { useAuditLog, useGenerateReportAdmin } from '@/lib/hooks/dashboard';
import { useAIInsights } from '@/lib/hooks/dashboard';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import BasePopover from '@/components/BasePopover';
import { toast } from 'sonner';
import {
  Shield,
  Activity,
  FileText,
  Database,
  AlertTriangle,
  RefreshCw,
  Zap,
  BarChart3,
  Lock,
  Users,
  Search,
  Eye,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  UserCog,
  Briefcase,
  DollarSign,
  BookOpen,
  FileText as FileTextIcon,
  MessageSquare,
  Settings,
  UserPlus
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { Role, UserStatus } from '@/generated/prisma';
import UserTable from './UserTable';
import UserDetailPopover from './UserDetailPopover';
import { useUserSettings } from '../hooks/useUserSettings';
import UserFormPopover from './UserFormPopover';

export default function AdminSettings() {
  const { userData } = useUserSettings();

  if (!userData || (userData.role !== 'ADMIN' && userData.role !== 'SUPER_ADMIN' && userData.role !== 'CEO' && userData.role !== Role.HR && userData.role !== Role.ACCOUNTANT && userData.role !== Role.MANAGER)) {
    return (
      <Card>
        <CardContent className="p-6 text-center bg-sidebar text-muted-foreground">
          You do not have permission to access admin settings.
        </CardContent>
      </Card>
    );
  }

  // 🔹 Fetch system intelligence
  const { data: logs = [] } = useAuditLog();
  const generateReport = useGenerateReportAdmin();
  const { data: insights = [] } = useAIInsights();

  // 🔹 Fetch users for management
  const { data: users = [], isLoading: isUsersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['users', 'management'],
    queryFn: async () => {
      const res = await fetch('/api/settings/pending-users');
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    }
  });

  // 🔹 Auto-backup setting
  const [autoBackup, setAutoBackup] = useState(true);

  // 🔹 Data retention policy
  const [retentionDays, setRetentionDays] = useState(180);

  // 🔹 Manual backup trigger
  const { mutate: runBackup, isPending: isBackingUp } = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/backup', { method: 'POST' });
      if (!res.ok) throw new Error('Backup failed');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Backup completed successfully');
    },
    onError: () => {
      toast.error('Coming soon...');
    },
  });

  // 🔹 Generate report handler
  const handleGenerateReport = (type: string) => {
    generateReport.mutate({ type, dateRange: 'last30days' });
  };

  // Recent critical actions
  const criticalActions = logs
    .filter((log: any) => log.severity === 'CRITICAL')
    .slice(0, 3);

  return (
    <Card className="bg-sidebar border-[var(--sidebar-border)] shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sidebar-foreground">
          <Shield className="h-5 w-5" />
          Admin Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* 👥 User Management */}
        <section>
          <h3 className="text-lg font-medium text-sidebar-foreground mb-4 flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Management
          </h3>

          <div className="mb-4 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/50" />
              <Input
                placeholder="Search users..."
                className="pl-9 bg-sidebar-accent/10 border-sidebar-accent/30"
              />
            </div>
            <Button variant="outline" size="sm">
              <FilterIcon className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>

            {/* Add Create User button */}
            <UserFormPopover>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Create User
              </Button>
            </UserFormPopover>
          </div>

          <UserTable
            users={users}
            isLoading={isUsersLoading}
            refetchUsers={refetchUsers}
          />
        </section>

        {/* 🛡️ Security Settings */}
        <section>
          <h3 className="text-lg font-medium text-sidebar-foreground mb-4 flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Security Settings
          </h3>
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between p-3 bg-sidebar-primary/70 rounded">
              <div>
                <Label>Enforce Two-Factor Authentication</Label>
                <p className="text-sidebar-foreground/60">All users must enable 2FA</p>
              </div>
              <Switch defaultChecked={true} />
            </div>

            <div className="flex items-center justify-between p-3 bg-sidebar-primary/70 rounded">
              <div>
                <Label>Session Timeout</Label>
                <p className="text-sidebar-foreground/60">Auto-logout after 30 minutes</p>
              </div>
              <Switch defaultChecked={true} />
            </div>

            <div className="flex items-center justify-between p-3 bg-sidebar-primary/70 rounded">
              <div>
                <Label>IP Whitelisting</Label>
                <p className="text-sidebar-foreground/60">Restrict access to office IPs</p>
              </div>
              <Switch defaultChecked={false} />
            </div>
          </div>
        </section>

        {/* 📊 Audit Logs */}
        <section>
          <h3 className="text-lg font-medium text-sidebar-foreground mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Audit Logs
          </h3>
          {logs.length > 0 ? (
            <div className="space-y-2 text-xs font-mono bg-sidebar-primary/70 p-3 rounded">
              {logs.slice(0, 5).map((log: any, i: number) => (
                <div key={i} className="flex justify-between py-1 border-b border-sidebar-accent/20 last:border-b-0">
                  <span>{log.action}</span>
                  <span className="text-sidebar-foreground/60">{formatDate(log.timestamp)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-sidebar-foreground/60">No audit logs available.</p>
          )}
          <Button variant="outline" size="sm" className="mt-2 text-xs">
            View Full Logs
          </Button>
        </section>

        {/* ⚠️ Critical Actions */}
        {criticalActions.length > 0 && (
          <section>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-4 w-4" />
              Recent Critical Actions
            </h3>
            <div className="space-y-2 text-sm">
              {criticalActions.map((log: any, i: number) => (
                <div key={i} className="p-3 bg-red-500/10 border border-red-500/20 rounded">
                  <p className="font-medium">{log.action}</p>
                  <p className="text-xs text-red-300 mt-1">
                    By {log.actor?.email} on {formatDate(log.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 💾 Backup Settings */}
        <section>
          <h3 className="text-lg font-medium text-sidebar-foreground mb-4 flex items-center gap-2">
            <Database className="h-4 w-4" />
            Backup & Recovery
          </h3>
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between p-3 bg-sidebar-primary/70 rounded">
              <div>
                <Label>Auto-Backup Schedule</Label>
                <p className="text-sidebar-foreground/60">Daily at 02:00 AM</p>
              </div>
              <Switch
                checked={autoBackup}
                onCheckedChange={setAutoBackup}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-sidebar-primary/70 rounded">
              <div>
                <Label>Data Retention Policy</Label>
                <p className="text-sidebar-foreground/60">Keep logs for {retentionDays} days</p>
              </div>
              <BasePopover
                title="Set Retention Policy"
                buttonLabel={retentionDays + " days"}
              >
                <div className="space-y-4">
                  <Label>Retention Period (days)</Label>
                  <Input
                    type="number"
                    defaultValue={retentionDays}
                    onChange={(e) => setRetentionDays(parseInt(e.target.value))}
                    min="30"
                    max="365"
                  />
                  <Button className="w-full">Save Policy</Button>
                </div>
              </BasePopover>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => runBackup()}
                disabled={isBackingUp}
                className="text-xs flex items-center gap-1"
              >
                <RefreshCw className={`h-3 w-3 ${isBackingUp ? 'animate-spin' : ''}`} />
                {isBackingUp ? 'Running...' : 'Run Backup Now'}
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                Restore from Backup
              </Button>
            </div>
          </div>
        </section>

        {/* 📈 Reports */}
        <section>
          <h3 className="text-lg font-medium text-sidebar-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Reports
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleGenerateReport('user-activity')}
              disabled={generateReport.isPending}
            >
              User Report
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleGenerateReport('financial-summary')}
            >
              Financial Report
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleGenerateReport('inventory-status')}
            >
              Inventory Report
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleGenerateReport('hr-compliance')}
            >
              HR Compliance
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleGenerateReport('security-audit')}
            >
              Security Audit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleGenerateReport('system-health')}
            >
              System Health
            </Button>
          </div>
        </section>

        {/* 💡 AI Insights */}
        <section>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-blue-400">
            <Zap className="h-4 w-4" />
            AI-Powered Recommendations
          </h3>
          {insights.length > 0 ? (
            <div className="space-y-3">
              {insights.slice(0, 3).map((insight: string, i: number) => (
                <div
                  key={i}
                  className="p-3 bg-blue-500/10 border border-blue-500/20 rounded text-sm text-blue-200 flex items-start gap-2"
                >
                  <Zap className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-400" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-sidebar-foreground/60">No AI insights available.</p>
          )}
          <Button variant="link" size="sm" className="p-0 h-auto mt-1 text-blue-400">
            Refresh Insights
          </Button>
        </section>
      </CardContent>
    </Card>
  );
}

// Helper component for filter icon
function FilterIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

// 🔹 Helper: Format date
function formatDate(date: string | number | Date) {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}