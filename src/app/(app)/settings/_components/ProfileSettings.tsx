'use client';

import { useRecentActivities } from '@/lib/hooks/dashboard';
import { useHREmployeesPreview } from '@/lib/hooks/hr';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import BasePopover from '@/components/BasePopover';
import { toast } from 'sonner';
import Image from 'next/image';
import { format } from 'date-fns';
import { Calendar, Clock, User, Briefcase, MessageSquare, Building2 } from 'lucide-react';
import { useUserSettings } from '../hooks/useUserSettings';
import { useUpdateUser } from '../hooks/useUpdateUser';
import { fullName } from '../hooks/types';
import { Label } from '@/components/ui/label';
import { useGetTasks } from '@/features/tasks/api/use-get-tasks';
import { TASK_STATUS } from '@/hooks/type';

export default function ProfileSettings() {
  const { userData } = useUserSettings();
  const { userForm, updateUser, isUpdating } = useUpdateUser(userData);

  // 🔹 Fetch user-specific data
  const { data: activities = [] } = useRecentActivities();
  const { data: employees = [] } = useHREmployeesPreview();
  const { data: tasks = [] } = useGetTasks({
    workspaceId: 'default', // or from context
    assigneeId: userData?.id,
    status: TASK_STATUS.IN_PROGRESS,
  });

  if (!userData) return null;

  const { register, handleSubmit, formState } = userForm;
  const { errors } = formState;

  // Find current user's employee record
  const myEmployee = employees.find((e: any) => e.user?.id === userData.id);

  // Last login from recent activities
  const lastLogin = activities.find((a: any) => a.type === 'LOGIN');
  const lastActive = lastLogin ? new Date(lastLogin.timestamp) : new Date();

  // Pending task count
  const pendingTasks = tasks.filter((t: any) => t.status !== 'COMPLETED').length;

  return (
    <Card className="bg-sidebar border-[var(--sidebar-border)] shadow-lg">
      <CardContent className="p-0">
        {/* Company Cover */}
        <div
          className="h-32 w-full bg-cover bg-center rounded-t-lg"
          style={{
            backgroundImage: `url(${userData.company?.images?.[0]?.url || 'https://lachsgolden.com/wp-content/uploads/2024/01/LACHS-logo-02-2048x1006-removebg-preview-e1735063006450.png'})`,
          }}
        ></div>

        {/* Profile Content */}
        <div className="relative px-6 pb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 -mt-12">
            {/* Profile Image */}
            <Image
              src={userData.images?.[0]?.url || 'https://lachsgolden.com/wp-content/uploads/2024/01/LACHS-logo-02-2048x1006-removebg-preview-e1735063006450.png'}
              alt="Profile"
              width={100}
              height={100}
              className="rounded-full border-4 border-sidebar"
            />

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold text-sidebar-foreground">
                    {fullName(userData)}
                  </h3>
                  <p className="text-sm text-sidebar-foreground/80">
                    {myEmployee?.jobTitle || userData.role} • {userData.company?.name}
                  </p>
                </div>

                {/* Edit Profile Button */}
                <BasePopover
                  title="Edit Profile"
                  buttonLabel="Edit Profile"
                >
                  <form onSubmit={handleSubmit(updateUser)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          {...register('firstName')}
                          className="bg-sidebar text-sidebar-foreground border-[var(--sidebar-border)]"
                          aria-invalid={errors.firstName ? 'true' : 'false'}
                        />
                        {errors.firstName && (
                          <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          {...register('lastName')}
                          className="bg-sidebar text-sidebar-foreground border-[var(--sidebar-border)]"
                          aria-invalid={errors.lastName ? 'true' : 'false'}
                        />
                        {errors.lastName && (
                          <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        className="bg-sidebar text-sidebar-foreground border-[var(--sidebar-border)]"
                        aria-invalid={errors.email ? 'true' : 'false'}
                      />
                      {errors.email && (
                        <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="password">New Password (optional)</Label>
                      <Input
                        id="password"
                        type="password"
                        {...register('password')}
                        className="bg-sidebar text-sidebar-foreground border-[var(--sidebar-border)]"
                        aria-invalid={errors.password ? 'true' : 'false'}
                      />
                      {errors.password && (
                        <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={isUpdating}
                      className="w-full bg-sidebar-accent text-sidebar-accent-foreground"
                    >
                      {isUpdating ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </form>
                </BasePopover>
              </div>

              <div className="mt-4 space-y-2 text-sm text-sidebar-foreground">
                <p><User className="inline mr-1 h-3 w-3" /> Email: {userData.email}</p>
                <p><Briefcase className="inline mr-1 h-3 w-3" /> Role: {userData.role}</p>
                <p><Clock className="inline mr-1 h-3 w-3" /> Last Active: {format(lastActive, 'MMM d, h:mm a')}</p>
                {myEmployee?.department && (
                  <p><Building2 className="inline mr-1 h-3 w-3" /> Dept: {myEmployee.department.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* 📊 Your Activity Panel */}
          <div className="mt-8 border-t border-[var(--sidebar-border)] pt-6">
            <h4 className="text-lg font-medium text-sidebar-foreground mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Your Activity
            </h4>

            <div className="space-y-4 text-sm">
              {/* Recent Tasks */}
              {pendingTasks > 0 && (
                <div className="p-3 bg-sidebar-accent/10 rounded border border-sidebar-accent/20">
                  <p className="font-medium">You have {pendingTasks} pending task(s)</p>
                  <p className="text-sidebar-foreground/70 mt-1">Complete them to stay on track</p>
                </div>
              )}

              {/* Recent Activities */}
              <div className="space-y-2">
                <p className="font-medium">Recent Actions</p>
                {activities.slice(0, 3).map((act: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sidebar-foreground/80">
                    <Calendar className="h-3 w-3" />
                    <span>{act.action} — {format(new Date(act.timestamp), 'MMM d')}</span>
                  </div>
                ))}
              </div>

              {/* Team Context */}
              {myEmployee && (
                <div className="p-3 bg-sidebar-accent/10 rounded">
                  <p className="font-medium">Team Info</p>
                  <p className="text-sidebar-foreground/80 text-xs mt-1">
                    Manager: {myEmployee.firstName || 'Not assigned'}<br />
                    Department: {myEmployee.department?.name || 'N/A'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}