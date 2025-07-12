'use client';

import { useSession } from 'next-auth/react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import BasePopover from '@/components/BasePopover';
import { toast } from 'sonner';
import { format } from 'date-fns';
import axiosdb from '@/lib/axios';
import { Role, UserStatus } from '@/generated/prisma';
import Image from 'next/image';
import { useState } from 'react';
import { RestrictedAccessModal } from '../hr/_components/RestrictedAccessModal';
import { useDeleteCompany } from '@/lib/hooks/use-owner-company';

// Schema for user profile updates
const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserData {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: Role;
  employee?: {
    id: string;
    jobTitle: string | null;
    department: { name: string } | null;
    hireDate: string | null;
  } | null;
  company: {
    id: string;
    name: string;
    contactEmail: string | null;
    addressLine1: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
    images: { url: string }[] | null;
  } | null;
  images: { url: string }[] | null;
}

interface PendingUser {
  id: string;
  email: string;
  name: string | null;
  status: UserStatus;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [restrictedTab, setRestrictedTab] = useState<string | null>(null);
  const deleteCompany = useDeleteCompany();

  // Fetch user data
  const { data: userData, isLoading } = useQuery<UserData>({
    queryKey: ['userSettings'],
    queryFn: async () => {
      const res = await axiosdb.get('/api/settings/user');
      return res.data;
    },
    enabled: !!session?.user.id,
  });

  // Fetch pending users for Admin Settings
  const { data: pendingUsers, isLoading: isPendingUsersLoading } = useQuery<PendingUser[]>({
    queryKey: ['pendingUsers'],
    queryFn: async () => {
      const res = await axiosdb.get('/api/settings/pending-users');
      return res.data;
    },
    enabled: !!session?.user.id && (session?.user.role === Role.ADMIN || session?.user.role === Role.OWNER),
  });

  // User form setup
  const userForm = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: userData?.firstName || '',
      lastName: userData?.lastName || '',
      email: userData?.email || '',
    },
  });

  // Update user mutation
  const updateUser = useMutation({
    mutationFn: async (data: UserFormData) => {
      const res = await axiosdb.patch('/api/settings/user', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Profile updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    },
  });

  const canAccessTab = (tab: string) => {
    if (!session?.user) return false;
    if (tab === 'profile') return true;
    if (tab === 'employee' && userData?.employee) return true;
    if (tab === 'company' && (session.user.role === Role.ADMIN || session.user.role === Role.OWNER)) return true;
    if (tab === 'admin' && (session.user.role === Role.ADMIN || session.user.role === Role.OWNER)) return true;
    if (tab === 'owner' && session.user.role === Role.OWNER) return true;
    return false;
  };

  const handleTabChange = (tab: string) => {
    if (!canAccessTab(tab)) {
      setRestrictedTab(tab);
      return;
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <div className="@container/main flex flex-1 flex-col gap-4">
        <h1 className="text-3xl font-semibold text-sidebar-foreground">Settings</h1>
        <div className="flex items-center flex-col justify-cente px-4 shadow-lg">
          <Card className="w-full max-w-4xl bg-sidebar text-sidebar-foreground border-[var(--sidebar-border)] shadow-lg rounded-2xl">
            {/* <CardHeader>
          <CardTitle className="text-[24px] font-semibold text-sidebar-foreground"></CardTitle>
        </CardHeader> */}
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full rounded bg-muted" />
              ) : (
                <Tabs defaultValue="profile" onValueChange={handleTabChange}>
                  <div className="overflow-x-auto">
                    <TabsList className="flex bg-sidebar-accent text-sidebar-accent-foreground">
                      <TabsTrigger value="profile">Profile</TabsTrigger>
                      {userData?.employee && <TabsTrigger value="employee">Employee Settings</TabsTrigger>}
                      {(session?.user.role === Role.ADMIN || session?.user.role === Role.OWNER) && (
                        <TabsTrigger value="company">Company Settings</TabsTrigger>
                      )}
                      {(session?.user.role === Role.ADMIN || session?.user.role === Role.OWNER) && (
                        <TabsTrigger value="admin">Admin Settings</TabsTrigger>
                      )}
                      {session?.user.role === Role.OWNER && <TabsTrigger value="owner">Owner Settings</TabsTrigger>}
                    </TabsList>
                  </div>

                  {/* Profile Tab */}
                  <TabsContent value="profile" className="mt-4 max-h-[600px] overflow-y-auto">
                    <div className="relative">
                      {/* Company Cover Image */}
                      <div
                        className="h-40 w-full bg-cover bg-center rounded-t-lg"
                        style={{
                          backgroundImage: `url(${userData?.company?.images?.[0]?.url || 'https://github.com/shadcn.png'})`,
                        }}
                      ></div>
                      {/* Profile Section */}
                      <div className="relative p-6">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                          <Image
                            src={userData?.images?.[0]?.url || 'https://github.com/shadcn.png'}
                            alt="Profile"
                            width={120}
                            height={120}
                            className="rounded-full border-4 border-sidebar -mt-16"
                          />
                          <div className="flex-1 text-center md:text-left">
                            <div className="flex justify-between items-center">
                              <h3 className="text-2xl font-semibold text-sidebar-foreground">
                                {userData?.firstName} {userData?.lastName}
                              </h3>
                              <BasePopover title="Edit Profile" buttonLabel="Edit Profile">
                                <form
                                  onSubmit={userForm.handleSubmit((data) => updateUser.mutate(data))}
                                  className="space-y-4 w-80 md:w-96"
                                >
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <Label htmlFor="firstName">First Name</Label>
                                      <Input
                                        id="firstName"
                                        {...userForm.register('firstName')}
                                        className="bg-sidebar text-sidebar-foreground border-[var(--sidebar-border)]"
                                      />
                                      {userForm.formState.errors.firstName && (
                                        <p className="text-xs text-red-500">
                                          {userForm.formState.errors.firstName.message}
                                        </p>
                                      )}
                                    </div>
                                    <div>
                                      <Label htmlFor="lastName">Last Name</Label>
                                      <Input
                                        id="lastName"
                                        {...userForm.register('lastName')}
                                        className="bg-sidebar text-sidebar-foreground border-[var(--sidebar-border)]"
                                      />
                                      {userForm.formState.errors.lastName && (
                                        <p className="text-xs text-red-500">
                                          {userForm.formState.errors.lastName.message}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                      id="email"
                                      type="email"
                                      {...userForm.register('email')}
                                      className="bg-sidebar text-sidebar-foreground border-[var(--sidebar-border)]"
                                    />
                                    {userForm.formState.errors.email && (
                                      <p className="text-xs text-red-500">{userForm.formState.errors.email.message}</p>
                                    )}
                                  </div>
                                  <div>
                                    <Label htmlFor="password">New Password (optional)</Label>
                                    <Input
                                      id="password"
                                      type="password"
                                      {...userForm.register('password')}
                                      className="bg-sidebar text-sidebar-foreground border-[var(--sidebar-border)]"
                                    />
                                    {userForm.formState.errors.password && (
                                      <p className="text-xs text-red-500">{userForm.formState.errors.password.message}</p>
                                    )}
                                  </div>
                                  <Button
                                    type="submit"
                                    disabled={updateUser.isPending}
                                    className="w-full bg-sidebar-accent text-sidebar-accent-foreground"
                                  >
                                    {updateUser.isPending ? 'Updating...' : 'Update Profile'}
                                  </Button>
                                </form>
                              </BasePopover>
                            </div>
                            <p className="text-sm text-sidebar-foreground mt-2">Email: {userData?.email}</p>
                            <p className="text-sm text-sidebar-foreground">Role: {userData?.role}</p>
                            <p className="text-sm text-sidebar-foreground">Company: {userData?.company?.name}</p>
                          </div>
                        </div>

                        {/* Employee Sections */}
                        {userData?.employee && (
                          <div className="mt-6 space-y-6">
                            <div>
                              <h4 className="text-lg font-medium text-sidebar-foreground">Tasks</h4>
                              <ul className="space-y-2 mt-2">
                                <li className="p-3 bg-sidebar-accent rounded">
                                  Task 1 - Due: 2023-10-01 - Status: In Progress
                                </li>
                                <li className="p-3 bg-sidebar-accent rounded">
                                  Task 2 - Due: 2023-10-05 - Status: Completed
                                </li>
                                <li className="p-3 bg-sidebar-accent rounded">
                                  Task 3 - Due: 2023-10-10 - Status: Pending
                                </li>
                              </ul>
                            </div>
                            <div>
                              <h4 className="text-lg font-medium text-sidebar-foreground">Reviews</h4>
                              <ul className="space-y-2 mt-2">
                                <li className="p-3 bg-sidebar-accent rounded">
                                  Review 1 - Date: 2023-09-01 - Rating: 4/5
                                </li>
                                <li className="p-3 bg-sidebar-accent rounded">
                                  Review 2 - Date: 2023-08-15 - Rating: 5/5
                                </li>
                                <li className="p-3 bg-sidebar-accent rounded">
                                  Review 3 - Date: 2023-07-20 - Rating: 3/5
                                </li>
                              </ul>
                            </div>
                            <div>
                              <h4 className="text-lg font-medium text-sidebar-foreground">Workspaces</h4>
                              <ul className="space-y-2 mt-2">
                                <li className="p-3 bg-sidebar-accent rounded">Workspace 1</li>
                                <li className="p-3 bg-sidebar-accent rounded">Workspace 2</li>
                                <li className="p-3 bg-sidebar-accent rounded">Workspace 3</li>
                              </ul>
                            </div>
                            {/* Extra Sections for Scrollability */}
                            <div>
                              <h4 className="text-lg font-medium text-sidebar-foreground">Preferences</h4>
                              <p className="text-sm text-sidebar-foreground mt-2">
                                Customize your notification settings and UI preferences here.
                              </p>
                            </div>
                            <div>
                              <h4 className="text-lg font-medium text-sidebar-foreground">Activity Log</h4>
                              <p className="text-sm text-sidebar-foreground mt-2">
                                View your recent activity and interactions within the platform.
                              </p>
                            </div>
                          </div>
                        )}
                        {/* Extra Sections for Non-Employees */}
                        {!userData?.employee && (
                          <div className="mt-6 space-y-6">
                            <div>
                              <h4 className="text-lg font-medium text-sidebar-foreground">Account Details</h4>
                              <p className="text-sm text-sidebar-foreground mt-2">
                                Additional account information like registration date, etc.
                              </p>
                            </div>
                            <div>
                              <h4 className="text-lg font-medium text-sidebar-foreground">Preferences</h4>
                              <p className="text-sm text-sidebar-foreground mt-2">
                                Customize your notification settings and UI preferences here.
                              </p>
                            </div>
                            <div>
                              <h4 className="text-lg font-medium text-sidebar-foreground">Activity Log</h4>
                              <p className="text-sm text-sidebar-foreground mt-2">
                                View your recent activity and interactions within the platform.
                              </p>
                            </div>
                            <div>
                              <h4 className="text-lg font-medium text-sidebar-foreground">Support</h4>
                              <p className="text-sm text-sidebar-foreground mt-2">
                                Contact support or view help resources.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Employee Settings Tab */}
                  <TabsContent value="employee" className="mt-4 max-h-[600px] overflow-y-auto">
                    <Card>
                      <CardHeader>
                        <CardTitle>Employee Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium">Employee Details</h3>
                          <p className="mt-2">Job Title: {userData?.employee?.jobTitle || 'N/A'}</p>
                          <p>Department: {userData?.employee?.department?.name || 'N/A'}</p>
                          <p>
                            Hire Date:{' '}
                            {userData?.employee?.hireDate ? format(new Date(userData.employee.hireDate), 'yyyy-MM-dd') : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Performance</h3>
                          <p className="mt-2">Recent Review: Placeholder for review data.</p>
                          <p>Performance Metrics: Placeholder for metrics.</p>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Training</h3>
                          <p className="mt-2">Completed Courses: Placeholder for courses.</p>
                          <p>Upcoming Training: Placeholder for training.</p>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Leave Management</h3>
                          <p className="mt-2">View and request leave balances or statuses.</p>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Team Collaboration</h3>
                          <p className="mt-2">Details about team projects and collaborations.</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Company Settings Tab */}
                  <TabsContent value="company" className="mt-4 max-h-[600px] overflow-y-auto">
                    <Card>
                      <CardHeader>
                        <CardTitle>Company Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium">Company Details</h3>
                          <p className="mt-2">Name: {userData?.company?.name}</p>
                          <p>Industry: Placeholder industry.</p>
                          <p>Founded: Placeholder founding date.</p>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Address</h3>
                          <p className="mt-2">{userData?.company?.addressLine1 || 'N/A'}</p>
                          <p>
                            {userData?.company?.city}, {userData?.company?.state} {userData?.company?.postalCode}
                          </p>
                          <p>{userData?.company?.country}</p>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Contact Information</h3>
                          <p className="mt-2">Email: {userData?.company?.contactEmail || 'N/A'}</p>
                          <p>Phone: Placeholder phone number.</p>
                          <p>Website: Placeholder website URL.</p>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Financial Settings</h3>
                          <p className="mt-2">Forecasted Revenue: Placeholder revenue.</p>
                          <p>Forecasted Expenses: Placeholder expenses.</p>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Departments</h3>
                          <p className="mt-2">List of company departments and their details.</p>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Policies</h3>
                          <p className="mt-2">Company policies and guidelines.</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Admin Settings Tab */}
                  <TabsContent value="admin" className="mt-4 max-h-[600px] overflow-y-auto">
                    <Card>
                      <CardHeader>
                        <CardTitle>Admin Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium">User Management</h3>
                          <p className="mt-2">Manage user roles, permissions, and statuses.</p>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Security Settings</h3>
                          <p className="mt-2">Configure password policies, two-factor authentication, etc.</p>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Audit Logs</h3>
                          <p className="mt-2">View recent actions and changes within the company.</p>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Reports</h3>
                          <p className="mt-2">Generate and view company-wide reports.</p>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Backup Settings</h3>
                          <p className="mt-2">Configure data backups and recovery options.</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Owner Settings Tab */}
                  <TabsContent value="owner" className="mt-4 max-h-[600px] overflow-y-auto">
                    <Card>
                      <CardHeader>
                        <CardTitle>Owner Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium">Company Ownership</h3>
                          <p className="mt-2">Manage company owners and transfer ownership.</p>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Billing</h3>
                          <p className="mt-2">View and manage billing information and subscription plans.</p>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Integrations</h3>
                          <p className="mt-2">Connect third-party services and APIs.</p>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Legal Documents</h3>
                          <p className="mt-2">Access and manage legal agreements and contracts.</p>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Analytics</h3>
                          <p className="mt-2">View detailed company analytics and insights.</p>
                        </div>
                        <div>
                          <BasePopover title="Delete Company" buttonLabel="Delete Company">
                            <div className="space-y-2">
                              <h4 className="font-medium text-sidebar-foreground">Confirm Deletion</h4>
                              <p className="text-sm text-sidebar-foreground">
                                Are you sure you want to delete {userData?.company?.name}? This action is irreversible.
                              </p>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteCompany.mutate(userData?.company?.id)}
                                disabled={deleteCompany.isPending}
                                className="bg-red-500 text-white"
                              >
                                {deleteCompany.isPending ? 'Deleting...' : 'Confirm Delete'}
                              </Button>
                            </div>
                          </BasePopover>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
              {restrictedTab && (
                <RestrictedAccessModal isOpen={!!restrictedTab} onClose={() => setRestrictedTab(null)} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}