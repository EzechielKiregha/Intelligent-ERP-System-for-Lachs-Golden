// app/settings/components/UserTable.tsx
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Role, UserStatus } from '@/generated/prisma';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Pencil,
  Eye,
  Trash2,
  Users
} from 'lucide-react';
import UserDetailPopover from './UserDetailPopover';

interface UserTableProps {
  users: any[];
  isLoading: boolean;
  refetchUsers: () => void;
}

// Status badge mapping
const STATUS_BADGES: Record<UserStatus, { variant: 'default' | 'secondary' | 'destructive', label: string }> = {
  ACCEPTED: { variant: 'default', label: 'Active' },
  PENDING: { variant: 'secondary', label: 'Pending' },
  BLOCKED: { variant: 'destructive', label: 'Blocked' }
};

// Role badge mapping
const ROLE_BADGES: Record<Role, { variant: 'default' | 'secondary' | 'outline', label: string }> = {
  SUPER_ADMIN: { variant: 'default', label: 'Super Admin' },
  ADMIN: { variant: 'default', label: 'Admin' },
  CEO: { variant: 'outline', label: 'CEO' },
  MANAGER: { variant: 'outline', label: 'Manager' },
  HR: { variant: 'secondary', label: 'HR' },
  ACCOUNTANT: { variant: 'secondary', label: 'Accountant' },
  EMPLOYEE: { variant: 'secondary', label: 'Employee' },
  USER: { variant: 'secondary', label: 'User' },
  MEMBER: { variant: 'secondary', label: 'Member' }
};

interface UserData {

}

export default function UserTable({ users, isLoading, refetchUsers }: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'ALL'>('ALL');
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchTerm, statusFilter, roleFilter]);

  const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
    try {
      const res = await fetch(`/api/settings/user/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Failed to update user status');

      toast.success(`User status updated to ${newStatus}`);
      refetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
      console.error('Status update error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sidebar-accent"></div>
      </div>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <div className="text-center py-8 text-sidebar-foreground/70">
        <div className="flex justify-center mb-2">
          <Users className="h-8 w-8 opacity-50" />
        </div>
        <p>No users found</p>
        {searchTerm && <p className="text-sm mt-1">Try a different search term</p>}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-[var(--sidebar-border)]">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-sidebar-accent/50">
            <TableHead className="text-sidebar-foreground">Name</TableHead>
            <TableHead className="text-sidebar-foreground">Email</TableHead>
            <TableHead className="text-sidebar-foreground">Role</TableHead>
            <TableHead className="text-sidebar-foreground">Status</TableHead>
            <TableHead className="text-sidebar-foreground">Workspace</TableHead>
            <TableHead className="text-sidebar-foreground">Join Date</TableHead>
            <TableHead className="text-sidebar-foreground text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user: any) => (
            <TableRow key={user.id} className="hover:bg-sidebar-accent/50">
              <TableCell className="font-medium text-sidebar-foreground">
                <UserDetailPopover user={user}>
                  <span className="cursor-pointer hover:underline">
                    {user.firstName} {user.lastName}
                  </span>
                </UserDetailPopover>
              </TableCell>
              <TableCell className="text-sidebar-foreground/80">
                {user.email}
              </TableCell>
              <TableCell>
                <Badge variant={ROLE_BADGES[user.role as Role].variant}>
                  {ROLE_BADGES[user.role as Role].label}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_BADGES[user.status as UserStatus].variant}>
                  {STATUS_BADGES[user.status as UserStatus].label}
                </Badge>
              </TableCell>
              <TableCell className="text-sidebar-foreground/80">
                {user.workspaceName || 'N/A'}
              </TableCell>
              <TableCell className="text-sidebar-foreground/80">
                {format(new Date(user.createdAt), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="text-right">
                <UserDetailPopover user={user}>
                  <Button variant="ghost" size="icon" className="hover:text-sidebar-foreground">
                    <Eye className="h-4 w-4" />
                  </Button>
                </UserDetailPopover>

                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-sidebar-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Implement edit user functionality
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                {user.status === UserStatus.PENDING && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-green-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(user.id, UserStatus.ACCEPTED);
                    }}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                )}

                {user.status !== UserStatus.BLOCKED && user.status !== UserStatus.PENDING && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-red-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(user.id, UserStatus.BLOCKED);
                    }}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                )}

                {user.status === UserStatus.BLOCKED && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-green-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(user.id, UserStatus.ACCEPTED);
                    }}
                  >
                    <AlertTriangle className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}