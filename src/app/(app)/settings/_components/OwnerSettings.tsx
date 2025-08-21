'use client';

import { useFinanceForecast } from '@/lib/hooks/finance';
import { useBudgetData } from '@/lib/hooks/finance';
import { useFinanceInsights } from '@/lib/hooks/finance';
import { useRevenueAnalytics } from '@/lib/hooks/dashboard';
import { useDeleteCompany } from '@/lib/hooks/use-owner-company';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BasePopover from '@/components/BasePopover';
import { toast } from 'sonner';
import {
  CreditCard,
  Shield,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Trash2,
  Download,
  DollarSign,
  LineChart,
  FileText,
} from 'lucide-react';
import { useUserSettings } from '../hooks/useUserSettings';
import { useState } from 'react';

export default function OwnerSettings() {
  const { userData } = useUserSettings();
  const deleteCompany = useDeleteCompany();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);


  const isOwner = userData?.role === 'SUPER_ADMIN';
  if (!isOwner) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Only the company owner can access these settings.
        </CardContent>
      </Card>
    );
  }

  // 🔹 Fetch strategic data
  const { data: forecast } = useFinanceForecast();
  const { data: budgetData } = useBudgetData();
  const { data: insights = [] } = useFinanceInsights();
  const { data: revenueData } = useRevenueAnalytics('year');

  // Derived metrics
  const nextMonthForecast = forecast?.forecast?.[0];
  const totalBudgetUsed = budgetData?.categories?.reduce((acc: number, c: any) => acc + (c.budgetUsed || 0), 0) || 0;
  const totalBudgetLimit = budgetData?.categories?.reduce((acc: number, c: any) => acc + (c.budgetLimit || 0), 0) || 0;
  const budgetUtilization = totalBudgetLimit > 0 ? (totalBudgetUsed / totalBudgetLimit) * 100 : 0;

  const growthRate = revenueData?.growthRate || 0;
  const isGrowing = growthRate > 0;

  return (
    <Card className="bg-sidebar border-[var(--sidebar-border)] shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sidebar-foreground">
          <Shield className="h-5 w-5" />
          Owner Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* 📈 Financial Forecast */}
        <section>
          <h3 className="text-lg font-medium text-sidebar-foreground mb-4 flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Financial Forecast (Next 6 Months)
          </h3>
          {forecast ? (
            <div className="space-y-3">
              {forecast.forecast.slice(0, 6).map((f: any, i: number) => (
                <div
                  key={i}
                  className="flex justify-between p-3 bg-sidebar-primary/50 rounded text-sm border border-sidebar-accent/20"
                >
                  <span className="font-medium">{f.month}</span>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-700">
                      ${f.projectedRevenue?.toLocaleString()}
                    </p>
                    <p className="text-sidebar-foreground/60 text-xs">
                      Exp: ${f.projectedExpenses?.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-sidebar-foreground/60">Loading forecast...</p>
          )}
        </section>

        {/* 💰 Budget Utilization */}
        <section>
          <h3 className="text-lg font-medium text-sidebar-foreground mb-4 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Budget Utilization
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Budget Used</span>
              <span>
                ${totalBudgetUsed.toLocaleString()} / ${totalBudgetLimit.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-sidebar-accent/20 rounded-full h-2">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
              ></div>
            </div>
            <Badge
              variant="outline"
              className={
                budgetUtilization > 90
                  ? 'bg-red-500/20 text-red-300 border-red-500/30'
                  : budgetUtilization > 70
                    ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                    : 'bg-green-500/20 text-green-300 border-green-500/30'
              }
            >
              {budgetUtilization.toFixed(0)}% Used
            </Badge>
          </div>
        </section>

        {/* 📊 Revenue Growth */}
        <section>
          <h3 className="text-lg font-medium text-sidebar-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Revenue Growth (YoY)
          </h3>
          <div className="p-4 bg-sidebar-primary/50 rounded text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp
                className={`h-5 w-5 ${isGrowing ? 'text-emerald-500' : 'text-red-500'}`}
              />
              <span
                className={`text-2xl font-bold ${isGrowing ? 'text-emerald-600' : 'text-red-600'}`}
              >
                {isGrowing ? '+' : ''}{growthRate.toFixed(1)}%
              </span>
            </div>
            <p className="text-sm text-sidebar-foreground/70">
              Compared to last year
            </p>
          </div>
        </section>

        {/* 💡 AI-Powered Insights */}
        <section>
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-blue-400">
            <Lightbulb className="h-4 w-4" />
            Strategic AI Insights
          </h3>
          {insights.length > 0 ? (
            <div className="space-y-3">
              {insights.slice(0, 3).map((insight: string, i: number) => (
                <div
                  key={i}
                  className="p-3 bg-blue-500/10 border border-blue-500/20 rounded text-sm text-blue-200 flex items-start gap-2"
                >
                  <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-400" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-sidebar-foreground/60">No insights available.</p>
          )}
        </section>

        {/* 💳 Billing & Subscription */}
        {/* <section>
          <h3 className="text-lg font-medium text-sidebar-foreground mb-4 flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing & Subscription
          </h3>
          <div className="text-sm space-y-2">
            <p>
              <strong>Plan:</strong>{' '}
              <Badge className="bg-green-500/20 text-green-300 hover:bg-green-500/30">
                Pro Plan
              </Badge>
            </p>
            <p>
              <strong>Status:</strong> Active
            </p>
            <p>
              <strong>Next Billing:</strong> May 5, 2026 — $499.00
            </p>
            <p>
              <strong>Payment Method:</strong> Visa •••• 4242
            </p>
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="outline" size="sm" className="text-xs">
              Change Plan
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              Update Payment
            </Button>
          </div>
        </section> */}

        {/* 🗑️ Danger Zone: Delete Company */}
        <section>
          <BasePopover
            title="Delete Company"
            buttonLabel="Delete Company"
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
          >
            <div className="space-y-4">
              <p className="text-sm text-red-800">
                Confirm deletion of <strong>{userData.company?.name}</strong>.
              </p>
              <ul className="text-xs text-red-300 list-disc list-inside space-y-1">
                <li>All users and roles</li>
                <li>All company data and settings</li>
                <li>Billing and subscription</li>
                <li>Integrations and logs</li>
              </ul>
              <div className="flex gap-2 justify-end pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    deleteCompany.mutate(userData.company?.id);
                    setIsDeleteModalOpen(false);
                    toast.error('Company deletion initiated.');
                  }}
                  disabled={deleteCompany.isPending}
                >
                  {deleteCompany.isPending ? 'Deleting...' : 'Delete Forever'}
                </Button>
              </div>
            </div>
          </BasePopover>
        </section>
      </CardContent>
    </Card >
  );
}

// 🔹 Lightbulb icon (missing in lucide-react? fallback)
function Lightbulb({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 14c.67 0 1.29.25 1.77.68l1.14-1.14a7.005 7.005 0 0 0-12.45 3.4" />
      <path d="M9 20h6" />
      <path d="M12 2v4" />
      <path d="m17 8-.87.87a4 4 0 0 1-5.66 0L7 5.74" />
    </svg>
  );
}