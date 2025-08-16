'use client';

import { useSingleEmployee } from '@/lib/hooks/hr';
import { useReviews } from '@/lib/hooks/hr';
import { usePayrollsByEmpId } from '@/lib/hooks/hr';
import { useHRPendingTasksPreview } from '@/lib/hooks/hr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Calendar, DollarSign, FileText, Users, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useGetTasks } from '@/features/tasks/api/use-get-tasks';
import { useUserSettings } from '../hooks/useUserSettings';
import { useGetMembersSwitcher } from '@/features/members/api/use-get-members';
import { useAuth } from 'contents/authContext';
import { TASK_STATUS } from '@/hooks/type';

export default function EmployeeSettings() {
  const { userData } = useUserSettings();
  const user = useAuth().user;
  const tasks = new Array();

  if (!userData?.employee) {
    return (
      <Card className="bg-sidebar border-[var(--sidebar-border)]">
        <CardContent className="p-6 text-center text-sidebar-foreground/70">
          No employee data available.
        </CardContent>
      </Card>
    );
  }

  // 🔹 Fetch employee-specific data
  const { data: employee } = useSingleEmployee(userData.employee.id);
  const { data: reviews = [] } = useReviews(userData.employee.id);
  const { data: payrolls = [] } = usePayrollsByEmpId(userData.employee.id);
  // const { data: tasks = [] } = useGetTasks({
  //   assigneeId: userData.id,
  //   workspaceId: 'default', // replace with context if available
  // });
  const { data: pendingTasks = [] } = useHRPendingTasksPreview();

  // 🔹 Fetch all member records for this user
  const { data: memberRecords = [], isPending: isMembersPending } = useGetMembersSwitcher({
    userId: user?.id,
  });

  // 🔹 Extract allowed workspace IDs
  const allowedWorkspaceIds = memberRecords.map((m: any) => m.workspaceId);
  allowedWorkspaceIds.forEach((id: string) => {
    const { data: tsks } = useGetTasks({
      workspaceId: id, // or from context
      assigneeId: userData?.id,
    });
    if (tsks) {
      tasks.push(...tsks.filter((t: any) => t.status !== TASK_STATUS.DONE));
    }
  });

  // Derived data
  const lastReview = reviews[0];
  const nextPayroll = payrolls.find((p: any) => new Date(p.issuedDate) > new Date());
  const pendingPersonalTasks = tasks.filter((t: any) => t.status !== TASK_STATUS.DONE).length;
  const pendingHRTasks = pendingTasks.filter((t: any) => t.assignee?.user?.id === userData.id).length;

  // Mock: Leave balance (extend with real hook later)
  const leaveBalance = {
    annual: { used: 8, total: 25 },
    sick: { used: 2, total: 10 },
    nextReset: 'Jan 1, 2026'
  };

  return (
    <Card className="bg-sidebar border-[var(--sidebar-border)] shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sidebar-foreground">
          <Users className="h-5 w-5" />
          Employee Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* 📊 Performance Summary */}
        <section>
          <h3 className="text-lg font-medium text-sidebar-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-sidebar-accent/20 rounded">
              <Label>Last Review</Label>
              <p className="font-medium mt-1">
                {lastReview ? format(new Date(lastReview.reviewDate), 'MMM d, yyyy') : 'Not scheduled'}
              </p>
              <Badge
                variant="outline"
                className={
                  lastReview?.rating === 'EXCEEDS' ? 'bg-green-500/20 text-green-300' :
                    lastReview?.rating === 'MEETS' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                }
              >
                {lastReview?.rating || 'N/A'}
              </Badge>
            </div>

            <div className="p-3 bg-sidebar-accent/20 rounded">
              <Label>Next Payroll</Label>
              <p className="font-medium mt-1">
                {nextPayroll ? format(new Date(nextPayroll.issuedDate), 'MMM d') : 'Not scheduled'}
              </p>
              <p className="text-xs text-sidebar-foreground/70">
                Net: ${nextPayroll?.netAmount?.toLocaleString() || '—'}
              </p>
            </div>

            <div className="p-3 bg-sidebar-accent/20 rounded">
              <Label>Active Tasks</Label>
              <p className="font-medium mt-1">{pendingPersonalTasks} pending</p>
              <p className="text-xs text-sidebar-foreground/70">
                {pendingHRTasks} HR actions due
              </p>
            </div>
          </div>
        </section>

        {/* 📅 Leave Management */}
        <section>
          <h3 className="text-lg font-medium text-sidebar-foreground mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Leave Balance
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-sidebar-accent/10 rounded">
              <div>
                <p className="font-medium">Annual Leave</p>
                <p className="text-sm text-sidebar-foreground/70">{leaveBalance.annual.used} of {leaveBalance.annual.total} days used</p>
              </div>
              <Badge variant="secondary">
                {leaveBalance.annual.total - leaveBalance.annual.used} left
              </Badge>
            </div>

            <div className="flex justify-between items-center p-3 bg-sidebar-accent/10 rounded">
              <div>
                <p className="font-medium">Sick Leave</p>
                <p className="text-sm text-sidebar-foreground/70">{leaveBalance.sick.used} of {leaveBalance.sick.total} days used</p>
              </div>
              <Badge variant="secondary">
                {leaveBalance.sick.total - leaveBalance.sick.used} left
              </Badge>
            </div>

            <p className="text-xs text-sidebar-foreground/60">
              Reset on {leaveBalance.nextReset}
            </p>

            <Button variant="outline" size="sm" className="text-xs">
              Request Leave
            </Button>
          </div>
        </section>

        {/* 💰 Payroll History */}
        <section>
          <h3 className="text-lg font-medium text-sidebar-foreground mb-4 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Payroll History
          </h3>
          {payrolls.length > 0 ? (
            <div className="space-y-2 text-sm">
              {payrolls.slice(0, 3).map((p: any) => (
                <div key={p.id} className="flex justify-between p-2 border-b border-sidebar-accent/20 last:border-b-0">
                  <span>{format(new Date(p.issuedDate), 'MMM d, yyyy')}</span>
                  <span className="font-medium">${p.netAmount?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-sidebar-foreground/60">No payroll records yet.</p>
          )}
          <Button variant="link" size="sm" className="p-0 h-auto mt-1">
            View All Payrolls
          </Button>
        </section>

        {/* 📝 Performance Reviews */}
        <section>
          <h3 className="text-lg font-medium text-sidebar-foreground mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Performance Reviews
          </h3>
          {reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.slice(0, 2).map((r: any) => (
                <div key={r.id} className="p-3 bg-sidebar-accent/10 rounded text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">{format(new Date(r.reviewDate), 'MMM yyyy')}</span>
                    <Badge>{r.rating}</Badge>
                  </div>
                  <p className="mt-2 line-clamp-2">{r.comments}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-sidebar-foreground/60">No reviews yet.</p>
          )}
          <Button variant="link" size="sm" className="p-0 h-auto mt-1">
            View All Reviews
          </Button>
        </section>

        {/* 🤝 Team Collaboration */}
        <section>
          <h3 className="text-lg font-medium text-sidebar-foreground mb-4 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Collaboration
          </h3>
          <div className="text-sm space-y-2">
            <p><strong>Team:</strong> {employee?.team?.name || 'Finance & Ops'}</p>
            <p><strong>Manager:</strong> {employee?.manager?.name || 'Sarah Chen'}</p>
            <p><strong>Projects:</strong> Budget Planning, ERP Migration</p>
            <p><strong>Workspace Access:</strong> 3 active workspaces</p>
          </div>
        </section>

        {/* ⚠️ Upcoming HR Tasks */}
        {pendingHRTasks > 0 && (
          <section>
            <h3 className="text-lg font-medium  mb-4 flex items-center gap-2 text-orange-400">
              <AlertTriangle className="h-4 w-4" />
              Action Required
            </h3>
            <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded text-sm">
              <p>You have <strong>{pendingHRTasks} pending HR task(s)</strong> — update your tax form, sign policy, etc.</p>
            </div>
          </section>
        )}
      </CardContent>
    </Card>
  );
}