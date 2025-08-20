// app/settings/components/UserStatusManagement.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, UserStatus } from '@/generated/prisma';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface UserStatusManagementProps {
  user: User;
  onSuccess?: () => void;
}

export default function UserStatusManagement({ user, onSuccess }: UserStatusManagementProps) {
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: async (status: UserStatus) => {
      const res = await fetch(`/api/settings/user/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!res.ok) throw new Error('Failed to update user status');
      return res.json();
    },
    onSuccess: () => {
      toast.success(`User status updated successfully`);
      queryClient.invalidateQueries({ queryKey: ['users', 'management'] });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error('Failed to update user status');
      console.error('Status update error:', error);
    }
  });

  const handleStatusChange = (newStatus: UserStatus) => {
    if (newStatus === user.status) return;

    let confirmationMessage = '';

    switch (newStatus) {
      case UserStatus.ACCEPTED:
        confirmationMessage = `Are you sure you want to activate this user's account?`;
        break;
      case UserStatus.BLOCKED:
        confirmationMessage = `Are you sure you want to block this user? They will lose access to the system.`;
        break;
      default:
        confirmationMessage = `Are you sure you want to change this user's status?`;
    }

    if (confirm(confirmationMessage)) {
      updateStatus.mutate(newStatus);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-sidebar border-[var(--sidebar-border)]">
        <CardHeader>
          <CardTitle className="text-sidebar-foreground">Current Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-sidebar-accent/10 rounded border border-sidebar-accent/20">
            <div className="flex items-center">
              {user.status === UserStatus.ACCEPTED && (
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              )}
              {user.status === UserStatus.PENDING && (
                <AlertTriangle className="h-5 w-5 text-amber-400 mr-2" />
              )}
              {user.status === UserStatus.BLOCKED && (
                <XCircle className="h-5 w-5 text-red-400 mr-2" />
              )}
              <div>
                <h3 className="font-medium text-sidebar-foreground">
                  {user.status === UserStatus.ACCEPTED ? 'Active' :
                    user.status === UserStatus.PENDING ? 'Pending' : 'Blocked'}
                </h3>
                <p className="text-sm text-sidebar-foreground/70">
                  {user.status === UserStatus.ACCEPTED ? 'User has full access to the system' :
                    user.status === UserStatus.PENDING ? 'User has not yet been activated' :
                      'User has been blocked from accessing the system'}
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={
                user.status === UserStatus.ACCEPTED ? 'text-green-400 border-green-400/30' :
                  user.status === UserStatus.PENDING ? 'text-amber-400 border-amber-400/30' :
                    'text-red-400 border-red-400/30'
              }
            >
              {user.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-sidebar border-[var(--sidebar-border)]">
        <CardHeader>
          <CardTitle className="text-sidebar-foreground">Change Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatusOption
              title="Activate Account"
              description="Grant user full access to the system"
              icon={<CheckCircle className="h-5 w-5 text-green-400" />}
              status={UserStatus.ACCEPTED}
              currentStatus={user.status}
              onClick={handleStatusChange}
              isLoading={updateStatus.isPending}
            />

            <StatusOption
              title="Block Account"
              description="Revoke user access to the system"
              icon={<XCircle className="h-5 w-5 text-red-400" />}
              status={UserStatus.BLOCKED}
              currentStatus={user.status}
              onClick={handleStatusChange}
              isLoading={updateStatus.isPending}
            />

            <StatusOption
              title="Pending Activation"
              description="User account requires activation"
              icon={<AlertTriangle className="h-5 w-5 text-amber-400" />}
              status={UserStatus.PENDING}
              currentStatus={user.status}
              onClick={handleStatusChange}
              isLoading={updateStatus.isPending}
            />
          </div>

          <div className="mt-6 p-4 bg-sidebar-accent/10 rounded border border-sidebar-accent/20">
            <h4 className="font-medium text-sidebar-foreground mb-2">Important Notes</h4>
            <ul className="space-y-2 text-sm text-sidebar-foreground/70">
              <li>• Blocking a user will immediately revoke their access to the system</li>
              <li>• User data will be preserved even if the account is blocked</li>
              <li>• You can reactivate a blocked user at any time</li>
              <li>• Pending users cannot log in until activated</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatusOptionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  status: UserStatus;
  currentStatus: UserStatus;
  onClick: (status: UserStatus) => void;
  isLoading: boolean;
}

function StatusOption({
  title,
  description,
  icon,
  status,
  currentStatus,
  onClick,
  isLoading
}: StatusOptionProps) {
  const isActive = currentStatus === status;

  return (
    <div
      className={`p-4 rounded border transition-all cursor-pointer ${isActive
        ? 'bg-sidebar-accent/20 border-sidebar-accent'
        : 'border-sidebar-accent/30 hover:border-sidebar-accent/50'
        }`}
      onClick={() => !isActive && onClick(status)}
    >
      <div className="flex items-start">
        <div className="mr-3 mt-0.5">{icon}</div>
        <div className="flex-1">
          <h3 className="font-medium text-sidebar-foreground">{title}</h3>
          <p className="text-sm text-sidebar-foreground/70 mt-1">{description}</p>
        </div>
      </div>

      {isActive && (
        <Badge
          variant="outline"
          className="mt-3 bg-sidebar-accent/20 text-sidebar-accent-foreground border-sidebar-accent/30"
        >
          Current Status
        </Badge>
      )}

      {!isActive && (
        <Button
          variant="outline"
          className="mt-3 w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Set as {title}
        </Button>
      )}
    </div>
  );
}