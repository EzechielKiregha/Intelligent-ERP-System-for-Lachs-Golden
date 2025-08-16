'use client';

import { useHREmployeesPreview } from '@/lib/hooks/hr';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from 'next-auth/react';
import { Role } from '@/generated/prisma';
import Link from 'next/link';
import { useState } from 'react';
import { RestrictedAccessModal } from './RestrictedAccessModal';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string | null;
  department: { name: string } | null;
  createdAt: string;
  user: { id: string } | null;
}

export default function RecentEmployeesPreview() {
  const { data, isLoading } = useHREmployeesPreview();
  const { data: session } = useSession();
  const [restrictedEmployeeId, setRestrictedEmployeeId] = useState<string | null>(null);

  const canAccessProfile = (employee: Employee) => {
    if (!session?.user) return false;
    return session.user.role === Role.SUPER_ADMIN || session.user.role === Role.ADMIN || session.user.id === employee.user?.id;
  };

  const handleEmployeeClick = (employee: Employee) => {
    if (!canAccessProfile(employee)) {
      setRestrictedEmployeeId(employee.id);
      return false;
    }
    return true;
  };

  return (
    <Card className="bg-sidebar text-sidebar-foreground border-[var(--sidebar-border)]">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Employees</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {isLoading ? (
          Array(5)
            .fill(0)
            .map((_, i) => <Skeleton key={i} className="h-6 w-full rounded bg-muted" />)
        ) : data?.length ? (
          data.map((emp: Employee) => (
            <Link
              key={emp.id}
              href={`/hr/employees/manage?id=${emp.id}`}
              onClick={(e) => {
                if (!handleEmployeeClick(emp)) e.preventDefault();
              }}
              className="block"
            >
              <div className="flex flex-col p-2 rounded-md hover:bg-sidebar-accent/60 transition-colors">
                <span className="font-medium">{emp.firstName} {emp.lastName}</span>
                <span className="text-xs text-muted-foreground">
                  {emp.jobTitle ?? 'No title'} • {emp.department?.name ?? 'No dept'}
                </span>
                <span className="text-xs text-muted-foreground">{emp.email}</span>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No recent employees found.</p>
        )}
      </CardContent>
      {restrictedEmployeeId && (
        <RestrictedAccessModal
          isOpen={!!restrictedEmployeeId}
          desc="You do not have permission to view this employee's profile."
          onClose={() => setRestrictedEmployeeId(null)}
        />
      )}
    </Card>
  );
}