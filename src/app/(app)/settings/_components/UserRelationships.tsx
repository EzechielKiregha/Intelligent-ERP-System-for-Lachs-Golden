// app/settings/components/UserRelationships.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Role } from '@/generated/prisma';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Users, Briefcase, Building2, MessageSquare } from 'lucide-react';
import { Deal } from '../../crm/deals/types/types';

interface UserRelationshipsProps {
  user: User;
}

export default function UserRelationships({ user }: UserRelationshipsProps) {
  // Fetch related data
  const { data: employeeData, isLoading: isEmployeeLoading } = useQuery({
    queryKey: ['employee', 'user', user.id],
    queryFn: async () => {
      const res = await fetch(`/api/hr/employees?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch employee data');
      return res.json();
    },
    enabled: !!user.id
  });

  const { data: memberData, isLoading: isMemberLoading } = useQuery({
    queryKey: ['member', 'user', user.id],
    queryFn: async () => {
      const res = await fetch(`/api/members?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch member data');
      return res.json();
    },
    enabled: !!user.id
  });

  const { data: dealData, isLoading: isDealLoading } = useQuery({
    queryKey: ['deals', 'user', user.id],
    queryFn: async () => {
      const res = await fetch(`/api/crm/deals?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch deal data');
      return res.json();
    },
    enabled: !!user.id
  });

  if (isEmployeeLoading || isMemberLoading || isDealLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-sidebar-accent" />
      </div>
    );
  }

  const employee = employeeData?.[0];
  const member = memberData?.[0];
  const deals = dealData || [];

  return (
    <div className="space-y-6">
      {/* Employee Information */}
      {employee ? (
        <Card className="bg-sidebar border-[var(--sidebar-border)]">
          <CardHeader>
            <div className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-sidebar-accent" />
              <CardTitle className="text-sidebar-foreground">Employee Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-sidebar-foreground/60">Department</p>
              <p className="font-medium text-sidebar-foreground">{employee.department?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-sidebar-foreground/60">Job Title</p>
              <p className="font-medium text-sidebar-foreground">{employee.jobTitle || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-sidebar-foreground/60">Hire Date</p>
              <p className="font-medium text-sidebar-foreground">
                {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-sidebar-foreground/60">Status</p>
              <Badge variant="secondary" className="mt-1">
                {employee.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-sidebar border-[var(--sidebar-border)]">
          <CardContent className="p-6 text-center text-sidebar-foreground/70">
            No employee record found for this user
          </CardContent>
        </Card>
      )}

      {/* Workspace Membership */}
      {member ? (
        <Card className="bg-sidebar border-[var(--sidebar-border)]">
          <CardHeader>
            <div className="flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-sidebar-accent" />
              <CardTitle className="text-sidebar-foreground">Workspace Membership</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-sidebar-foreground/60">Workspace</p>
              <p className="font-medium text-sidebar-foreground">{member.workspace?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-sidebar-foreground/60">Role</p>
              <Badge variant="secondary" className="mt-1">
                {member.role}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-sidebar-foreground/60">Member Since</p>
              <p className="font-medium text-sidebar-foreground">
                {new Date(member.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-sidebar border-[var(--sidebar-border)]">
          <CardContent className="p-6 text-center text-sidebar-foreground/70">
            No workspace membership found for this user
          </CardContent>
        </Card>
      )}

      {/* CRM Relationships */}
      {deals.length > 0 && (
        <Card className="bg-sidebar border-[var(--sidebar-border)]">
          <CardHeader>
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-sidebar-accent" />
              <CardTitle className="text-sidebar-foreground">CRM Relationships</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-sidebar-accent/10 rounded">
                <div>
                  <p className="text-sm text-sidebar-foreground/60">Total Deals</p>
                  <p className="text-2xl font-bold text-sidebar-foreground">{deals.length}</p>
                </div>
                <Badge variant="secondary">
                  {deals.filter((d: any) => d.stage === 'WON').length} Won
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {deals.slice(0, 2).map((deal: Deal) => (
                  <div key={deal.id} className="p-3 bg-sidebar-accent/10 rounded border border-sidebar-accent/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-sidebar-foreground line-clamp-1">{deal.title}</h3>
                        <p className="text-sm text-sidebar-foreground/70 mt-1">${deal.amount.toLocaleString()}</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={getStageBadgeColor(deal.stage)}
                      >
                        {deal.stage}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {deals.length > 2 && (
                <div className="text-center pt-2">
                  <button className="text-sidebar-accent hover:underline text-sm">
                    View all {deals.length} deals
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper to get stage badge color
function getStageBadgeColor(stage: string): string {
  switch (stage) {
    case 'WON': return 'bg-green-500/20 text-green-300 border-green-500/30';
    case 'LOST': return 'bg-red-500/20 text-red-300 border-red-500/30';
    case 'NEGOTIATION': return 'bg-amber-500/20 text-amber-500/30 border-amber-500/30';
    default: return 'bg-sidebar-accent/20 text-sidebar-accent-foreground border-sidebar-accent/30';
  }
}