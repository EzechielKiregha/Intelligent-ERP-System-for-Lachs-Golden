// app/settings/components/UserStatistics.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from '@/generated/prisma';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Briefcase, DollarSign, BookOpen, FileText as FileTextIcon, MessageSquare, CheckCircle, AlertTriangle } from 'lucide-react';

interface UserStatisticsProps {
  user: User;
}

export default function UserStatistics({ user }: UserStatisticsProps) {
  // Fetch statistics
  const { data: taskStats, isLoading: isTaskLoading } = useQuery({
    queryKey: ['tasks', 'stats', user.id],
    queryFn: async () => {
      const res = await fetch(`/api/tasks/stats?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch task statistics');
      return res.json();
    },
    enabled: !!user.id
  });

  const { data: payrollData, isLoading: isPayrollLoading } = useQuery({
    queryKey: ['payroll', 'user', user.id],
    queryFn: async () => {
      const res = await fetch(`/api/hr/payroll?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch payroll data');
      return res.json();
    },
    enabled: !!user.id
  });

  const { data: reviewData, isLoading: isReviewLoading } = useQuery({
    queryKey: ['reviews', 'user', user.id],
    queryFn: async () => {
      const res = await fetch(`/api/hr/reviews?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch review data');
      return res.json();
    },
    enabled: !!user.id
  });

  if (isTaskLoading || isPayrollLoading || isReviewLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-sidebar-accent" />
      </div>
    );
  }

  const tasks = taskStats || {
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0
  };

  const payroll = payrollData?.[0];
  const reviews = reviewData || [];

  return (
    <div className="space-y-6">
      {/* Task Statistics */}
      <Card className="bg-sidebar border-[var(--sidebar-border)]">
        <CardHeader>
          <div className="flex items-center">
            <Briefcase className="h-5 w-5 mr-2 text-sidebar-accent" />
            <CardTitle className="text-sidebar-foreground">Task Statistics</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Total Tasks"
              value={tasks.total}
              icon={<Briefcase className="h-4 w-4" />}
              color="text-sidebar-accent"
            />
            <StatCard
              title="Completed"
              value={tasks.completed}
              icon={<CheckCircle className="h-4 w-4" />}
              color="text-green-400"
            />
            <StatCard
              title="In Progress"
              value={tasks.inProgress}
              icon={<MessageSquare className="h-4 w-4" />}
              color="text-blue-400"
            />
            <StatCard
              title="Overdue"
              value={tasks.overdue}
              icon={<AlertTriangle className="h-4 w-4" />}
              color="text-red-400"
            />
          </div>

          {tasks.total > 0 && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-1">
                <span>Completion Rate</span>
                <span>{Math.round((tasks.completed / tasks.total) * 100)}%</span>
              </div>
              <div className="w-full bg-sidebar-accent/20 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((tasks.completed / tasks.total) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payroll Information */}
      {payroll && (
        <Card className="bg-sidebar border-[var(--sidebar-border)]">
          <CardHeader>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-sidebar-accent" />
              <CardTitle className="text-sidebar-foreground">Payroll Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-sidebar-foreground/60">Pay Period</p>
              <p className="font-medium text-sidebar-foreground">{payroll.payPeriod || 'Monthly'}</p>
            </div>
            <div>
              <p className="text-sm text-sidebar-foreground/60">Gross Amount</p>
              <p className="font-medium text-sidebar-foreground">${payroll.grossAmount?.toLocaleString() || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-sidebar-foreground/60">Tax Amount</p>
              <p className="font-medium text-sidebar-foreground">${payroll.taxAmount?.toLocaleString() || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-sidebar-foreground/60">Net Amount</p>
              <p className="font-medium text-sidebar-foreground">${payroll.netAmount?.toLocaleString() || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-sidebar-foreground/60">Last Issued</p>
              <p className="font-medium text-sidebar-foreground">
                {payroll.issuedDate ? new Date(payroll.issuedDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Reviews */}
      {reviews.length > 0 && (
        <Card className="bg-sidebar border-[var(--sidebar-border)]">
          <CardHeader>
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-sidebar-accent" />
              <CardTitle className="text-sidebar-foreground">Performance Reviews</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <div key={review.id} className="p-3 bg-sidebar-accent/10 rounded border border-sidebar-accent/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <Badge variant="secondary" className={getRatingBadgeColor(review.rating)}>
                          {formatRating(review.rating)}
                        </Badge>
                        <p className="ml-2 text-sm text-sidebar-foreground/60">
                          Reviewed by {review.reviewer?.name || 'Manager'}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-sidebar-foreground line-clamp-2">
                        {review.comments || 'No comments provided'}
                      </p>
                    </div>
                    <p className="text-xs text-sidebar-foreground/50 whitespace-nowrap">
                      {new Date(review.reviewDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper components
function StatCard({ title, value, icon, color }: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string
}) {
  return (
    <div className="p-4 bg-sidebar-accent/10 rounded border border-sidebar-accent/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-sidebar-foreground/60">{title}</p>
          <p className="text-2xl font-bold text-sidebar-foreground mt-1">{value}</p>
        </div>
        <div className={`${color} p-2 rounded bg-sidebar-accent/20`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function getRatingBadgeColor(rating: string): string {
  switch (rating) {
    case 'EXCEEDS': return 'bg-green-500/20 text-green-300 border-green-500/30';
    case 'MEETS': return 'bg-amber-500/20 text-amber-500/30 border-amber-500/30';
    default: return 'bg-red-500/20 text-red-500/30 border-red-500/30';
  }
}

function formatRating(rating: string): string {
  switch (rating) {
    case 'EXCEEDS': return 'Exceeds Expectations';
    case 'MEETS': return 'Meets Expectations';
    default: return 'Needs Improvement';
  }
}