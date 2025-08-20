// app/settings/components/UserRoleManagement.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Role } from '@/generated/prisma';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Users, Building2, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface UserRoleManagementProps {
  user: User;
  onSuccess?: () => void;
}

export default function UserRoleManagement({ user, onSuccess }: UserRoleManagementProps) {
  const queryClient = useQueryClient();

  // Fetch workspaces
  const { data: workspaces = [], isLoading: isWorkspacesLoading } = useQuery({
    queryKey: ['workspaces', 'user', user.id],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch workspaces');
      return res.json();
    },
    enabled: !!user.id
  });

  // Fetch available roles
  const { data: availableRoles = [], isLoading: isRolesLoading } = useQuery({
    queryKey: ['roles', 'available'],
    queryFn: async () => {
      const res = await fetch('/api/settings/roles');
      if (!res.ok) throw new Error('Failed to fetch available roles');
      return res.json();
    }
  });

  const [selectedRole, setSelectedRole] = useState<Role | null>(user.role);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);

  const updateRole = useMutation({
    mutationFn: async ({ role, workspaceId }: { role: Role; workspaceId?: string }) => {
      const res = await fetch(`/api/settings/user/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, workspaceId })
      });

      if (!res.ok) throw new Error('Failed to update user role');
      return res.json();
    },
    onSuccess: () => {
      toast.success(`User role updated successfully`);
      queryClient.invalidateQueries({ queryKey: ['users', 'management'] });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error('Failed to update user role');
      console.error('Role update error:', error);
    }
  });

  const handleRoleChange = (value: string) => {
    setSelectedRole(value as Role);
  };

  const handleWorkspaceChange = (value: string) => {
    setSelectedWorkspace(value);
  };

  const handleUpdateRole = () => {
    if (!selectedRole) return;

    const confirmationMessage =
      `Are you sure you want to change this user's role to ${formatRole(selectedRole)}?`;

    if (confirm(confirmationMessage)) {
      updateRole.mutate({
        role: selectedRole,
        workspaceId: selectedWorkspace || undefined
      });
    }
  };

  // Get current workspace
  const currentWorkspace = workspaces.find((ws: any) =>
    ws.members.some((m: any) => m.userId === user.id)
  );

  return (
    <div className="space-y-6">
      <Card className="bg-sidebar border-[var(--sidebar-border)]">
        <CardHeader>
          <CardTitle className="text-sidebar-foreground">Current Role & Workspace</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-sidebar-accent/10 rounded border border-sidebar-accent/20">
              <div className="flex items-center mb-2">
                <Users className="h-5 w-5 text-sidebar-accent mr-2" />
                <h3 className="font-medium text-sidebar-foreground">Current Role</h3>
              </div>
              <div className="ml-7">
                <Badge variant="secondary" className="px-3 py-1 h-auto text-base">
                  {formatRole(user.role)}
                </Badge>
                <p className="text-sm text-sidebar-foreground/70 mt-2">
                  {getRoleDescription(user.role)}
                </p>
              </div>
            </div>

            {currentWorkspace && (
              <div className="p-4 bg-sidebar-accent/10 rounded border border-sidebar-accent/20">
                <div className="flex items-center mb-2">
                  <Building2 className="h-5 w-5 text-sidebar-accent mr-2" />
                  <h3 className="font-medium text-sidebar-foreground">Current Workspace</h3>
                </div>
                <div className="ml-7">
                  <p className="font-medium text-sidebar-foreground">{currentWorkspace.name}</p>
                  <p className="text-sm text-sidebar-foreground/70 mt-1">
                    {currentWorkspace.description || 'No description available'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-sidebar border-[var(--sidebar-border)]">
        <CardHeader>
          <CardTitle className="text-sidebar-foreground">Update Role & Workspace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-sidebar-foreground">
              Select New Role
            </label>
            <Select
              value={selectedRole || ''}
              onValueChange={handleRoleChange}
              disabled={isRolesLoading || updateRole.isPending}
            >
              <SelectTrigger className="bg-sidebar border-sidebar-accent/30">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent className="bg-sidebar border-sidebar-accent">
                {availableRoles.map((role: Role) => (
                  <SelectItem
                    key={role}
                    value={role}
                    className="hover:bg-sidebar-accent/20"
                  >
                    {formatRole(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-sidebar-foreground/60 mt-1">
              {selectedRole ? getRoleDescription(selectedRole) : 'Select a role to see description'}
            </p>
          </div>

          {selectedRole && needsWorkspaceChange(user.role, selectedRole) && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-sidebar-foreground">
                Select Workspace
              </label>
              <Select
                value={selectedWorkspace || ''}
                onValueChange={handleWorkspaceChange}
                disabled={isWorkspacesLoading || updateRole.isPending}
              >
                <SelectTrigger className="bg-sidebar border-sidebar-accent/30">
                  <SelectValue placeholder="Select a workspace" />
                </SelectTrigger>
                <SelectContent className="bg-sidebar border-sidebar-accent">
                  {workspaces.map((workspace: any) => (
                    <SelectItem
                      key={workspace.id}
                      value={workspace.id}
                      className="hover:bg-sidebar-accent/20"
                    >
                      {workspace.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-sidebar-foreground/60 mt-1">
                Select the workspace where this user will have the new role
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleUpdateRole}
              disabled={!selectedRole || updateRole.isPending}
              className="flex items-center"
            >
              {updateRole.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Update Role
            </Button>
          </div>

          <div className="mt-6 p-4 bg-sidebar-accent/10 rounded border border-sidebar-accent/20">
            <h4 className="font-medium text-sidebar-foreground mb-2 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-400" />
              Important Notes
            </h4>
            <ul className="space-y-2 text-sm text-sidebar-foreground/70">
              <li>• Changing a user's role may affect their access to features and data</li>
              <li>• Some role changes require moving the user to a different workspace</li>
              <li>• The user will need to log out and back in for changes to take effect</li>
              <li>• Super Admin role should be granted sparingly to maintain security</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions
function formatRole(role: Role): string {
  switch (role) {
    case Role.SUPER_ADMIN: return 'Super Admin';
    case Role.ADMIN: return 'Admin';
    case Role.CEO: return 'CEO';
    case Role.MANAGER: return 'Manager';
    case Role.HR: return 'HR';
    case Role.ACCOUNTANT: return 'Accountant';
    case Role.EMPLOYEE: return 'Employee';
    case Role.USER: return 'User';
    case Role.MEMBER: return 'Member';
    default: return role;
  }
}

function getRoleDescription(role: Role): string {
  switch (role) {
    case Role.SUPER_ADMIN:
      return 'Full access to all features and settings across all workspaces';
    case Role.ADMIN:
      return 'Administrative access to company settings and user management';
    case Role.CEO:
      return 'Executive access to strategic reports and company-wide data';
    case Role.MANAGER:
      return 'Management access to team performance and project oversight';
    case Role.HR:
      return 'Access to employee records, payroll, and performance reviews';
    case Role.ACCOUNTANT:
      return 'Access to financial data, transactions, and reporting';
    case Role.EMPLOYEE:
      return 'Standard employee access to assigned tasks and projects';
    case Role.USER:
      return 'Basic user with limited access to the system';
    case Role.MEMBER:
      return 'Workspace member with access to workspace-specific features';
    default:
      return 'Custom role with specific permissions';
  }
}

function needsWorkspaceChange(oldRole: Role, newRole: Role): boolean {
  // These roles require specific workspaces
  const roleWorkspaces: Record<Role, string> = {
    [Role.ACCOUNTANT]: 'Finance Space',
    [Role.HR]: 'Human Resource Space',
    [Role.EMPLOYEE]: 'Sales Space',
    [Role.SUPER_ADMIN]: 'Lachs Golden Space',
    [Role.ADMIN]: 'Lachs Golden Space',
    [Role.CEO]: 'Lachs Golden Space',
    [Role.MANAGER]: 'Lachs Golden Space',
    [Role.USER]: 'Lachs Golden Space',
    [Role.MEMBER]: 'Lachs Golden Space'
  };

  return roleWorkspaces[oldRole] !== roleWorkspaces[newRole];
}