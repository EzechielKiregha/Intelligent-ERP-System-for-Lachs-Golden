// app/(dashboard)/inventory/reports/page.tsx
"use client"

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from 'contents/authContext';
import ExportReportButton from '../../finance/_components/ExportReportButton';

const InventoryReportsPage = () => {
  const user = useAuth().user;
  const router = useRouter();

  // Check if user has permission to access inventory reports
  const hasAccess = user?.role === 'ADMIN' ||
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'EMPLOYEE' ||
    user?.role === 'MANAGER';

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
              Inventory Reports Access
            </h2>
            <p className="text-sidebar-foreground/70 mb-6 max-w-2xl mx-auto">
              You don't have permission to view inventory reports. Inventory reports help manage stock levels
              and supply chain operations.
            </p>
            <div className="bg-sidebar-accent/10 border border-sidebar-accent/20 rounded p-4 text-left max-w-md mx-auto">
              <p className="font-medium text-sidebar-foreground mb-2">Available to:</p>
              <ul className="list-disc list-inside text-sidebar-foreground/70 space-y-1">
                <li>Administrators</li>
                <li>Inventory Managers</li>
                <li>Sales Team Members</li>
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
          <h1 className="text-2xl font-bold text-sidebar-foreground">Inventory Reports</h1>
        </div>
        <p className="text-sidebar-foreground/70">
          Generate inventory reports to monitor stock levels, identify low-stock items, and optimize inventory management.
        </p>
      </header>

      {/* Inventory Reports Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-sidebar border-[var(--sidebar-border)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-sidebar-foreground">
              Inventory Status Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-sidebar-foreground/70">
              Export a comprehensive report showing current stock levels, low-stock items, and inventory value.
            </p>
            <ExportReportButton
              type="inventory-status"
              label="Generate Status Report"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventoryReportsPage;