"use client"

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from 'contents/authContext';
import ExportReportButton from '../../finance/_components/ExportReportButton';

const CRMReportsPage = () => {
  const user = useAuth().user;
  const router = useRouter();

  // Check if user has permission to access CRM reports
  const hasAccess = user?.role === 'ADMIN' ||
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'EMPLOYEE' ||
    user?.role === 'SALES' ||
    user?.role === 'MANAGER' ||
    user?.role === 'CEO';

  if (!hasAccess) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Button
          variant='link'
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sidebar-primary hover:text-sidebar-accent mb-4"
        >
          <ArrowLeft size={16} /> Back
        </Button>

        <Card className="bg-sidebar border-[var(--sidebar-border)]">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-sidebar-foreground mb-4">
              CRM Reports Access
            </h2>
            <p className="text-sidebar-foreground/70 mb-6 max-w-2xl mx-auto">
              You don't have permission to view CRM reports. CRM reports help analyze sales performance
              and customer engagement metrics.
            </p>
            <div className="bg-sidebar-accent/10 border border-sidebar-accent/20 rounded p-4 text-left max-w-md mx-auto">
              <p className="font-medium text-sidebar-foreground mb-2">Available to:</p>
              <ul className="list-disc list-inside text-sidebar-foreground/70 space-y-1">
                <li>Administrators</li>
                <li>Sales Team Members</li>
                <li>Sales Managers</li>
                <li>Marketing Personnel</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <header className="space-y-2">
        <div className="flex items-center justify-between">
          <Button
            variant='link'
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sidebar-primary hover:text-sidebar-accent"
          >
            <ArrowLeft size={16} /> Back
          </Button>
          <h1 className="text-2xl font-bold text-sidebar-foreground">CRM Reports</h1>
        </div>
        <p className="text-sidebar-foreground/70">
          Generate CRM reports to analyze sales performance, pipeline health, and customer engagement.
        </p>
      </header>

      {/* CRM Reports Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-sidebar border-[var(--sidebar-border)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-sidebar-foreground">
              Sales Performance Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-sidebar-foreground/70">
              Export a detailed report showing sales conversion rates, revenue metrics, and top performers.
            </p>
            <ExportReportButton
              type="sales-performance"
              label="Generate Performance Report"
            />
          </CardContent>
        </Card>

        <Card className="bg-sidebar border-[var(--sidebar-border)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-sidebar-foreground">
              Pipeline Analysis Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-sidebar-foreground/70">
              Generate a comprehensive analysis of your sales pipeline including deal distribution and conversion rates.
            </p>
            <ExportReportButton
              type="pipeline-analysis"
              label="Generate Pipeline Report"
            />
          </CardContent>
        </Card>

        <Card className="bg-sidebar border-[var(--sidebar-border)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-sidebar-foreground">
              Contact Engagement Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-sidebar-foreground/70">
              Export a report showing customer engagement metrics, top contacts, and interaction history.
            </p>
            <ExportReportButton
              type="contact-engagement"
              label="Generate Engagement Report"
            />
          </CardContent>
        </Card>

        <Card className="bg-sidebar border-[var(--sidebar-border)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-sidebar-foreground">
              Sales Forecast Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-sidebar-foreground/70">
              Generate a forecast report showing projected revenue, top opportunities, and confidence levels.
            </p>
            <ExportReportButton
              type="forecast-report"
              label="Generate Forecast Report"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CRMReportsPage;