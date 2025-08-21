// components/reports/ExportReportButton.tsx
'use client';

import React from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

// All supported report types
type ReportType =
  | 'user-activity'
  | 'financial-summary'
  | 'transaction-summary'
  | 'expense-report'
  | 'income-report'
  | 'inventory-status'
  | 'hr-compliance'
  | 'security-audit'
  | 'system-health'
  | 'sales-performance'
  | 'pipeline-analysis'
  | 'contact-engagement'
  | 'forecast-report';

interface ExportReportButtonProps {
  type: ReportType;
  label?: string;
}

export default function ExportReportButton({ type, label = 'Export Report' }: ExportReportButtonProps) {
  const [dateRange, setDateRange] = React.useState<'last7days' | 'last30days' | 'lastquarter' | 'lastyear' | 'custom'>('last30days');
  const [customStart, setCustomStart] = React.useState('');
  const [customEnd, setCustomEnd] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGenerate = async () => {
    // Validate date range
    if (dateRange === 'custom') {
      if (!customStart || !customEnd) {
        toast.error('Select both start and end dates');
        return;
      }
      if (new Date(customStart) > new Date(customEnd)) {
        toast.error('Start date cannot be after end date');
        return;
      }
    }

    setIsGenerating(true);

    try {
      // Prepare request body with date range
      const requestBody: any = { type, dateRange };

      if (dateRange === 'custom') {
        requestBody.startDate = customStart;
        requestBody.endDate = customEnd;
      }

      // Send POST request to the specific report endpoint
      const response = await fetch(`/api/reports/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle the PDF download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Generate appropriate filename based on report type and date range
      const today = new Date().toISOString().split('T')[0];
      let filename = '';

      // Create meaningful filename
      switch (type) {
        case 'user-activity':
          filename = `user-activity-report_${today}.pdf`;
          break;
        case 'financial-summary':
          filename = `financial-summary_${today}.pdf`;
          break;
        case 'transaction-summary':
          filename = `transaction-summary_${today}.pdf`;
          break;
        case 'expense-report':
          filename = `expense-report_${today}.pdf`;
          break;
        case 'income-report':
          filename = `income-report_${today}.pdf`;
          break;
        case 'inventory-status':
          filename = `inventory-status_${today}.pdf`;
          break;
        case 'hr-compliance':
          filename = `hr-compliance_${today}.pdf`;
          break;
        case 'security-audit':
          filename = `security-audit_${today}.pdf`;
          break;
        case 'system-health':
          filename = `system-health_${today}.pdf`;
          break;
        case 'sales-performance':
          filename = `sales-performance_${today}.pdf`;
          break;
        case 'pipeline-analysis':
          filename = `pipeline-analysis_${today}.pdf`;
          break;
        case 'contact-engagement':
          filename = `contact-engagement_${today}.pdf`;
          break;
        case 'forecast-report':
          filename = `forecast-report_${today}.pdf`;
          break;
        default:
          filename = `${(type as string).replace(/-/g, '_')}_report_${today}.pdf`;
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Report downloaded successfully');
    } catch (error: any) {
      console.error('Report generation error:', error);
      toast.error(`Failed to generate report: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-2 bg-sidebar border border-sidebar-border/50 rounded p-3">
      {/* Select date range */}
      <div className="flex items-center gap-2">
        <Label className="text-sidebar-foreground/70">Range:</Label>
        <Select value={dateRange} onValueChange={(value) => setDateRange(value as any)}>
          <SelectTrigger className="w-48 bg-sidebar text-sidebar-foreground border-sidebar-border">
            <SelectValue placeholder="Select Date Range" />
          </SelectTrigger>
          <SelectContent className="bg-sidebar border-sidebar-border">
            <SelectItem value="last7days">Last 7 days</SelectItem>
            <SelectItem value="last30days">Last 30 days</SelectItem>
            <SelectItem value="lastquarter">Last quarter</SelectItem>
            <SelectItem value="lastyear">Last year</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {dateRange === 'custom' && (
        <div className="flex items-end gap-4">
          <div className="flex flex-col">
            <Label htmlFor="startDate" className="text-sidebar-foreground/70">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="max-w-xs bg-sidebar text-sidebar-foreground border-sidebar-border"
            />
          </div>
          <div className="flex flex-col">
            <Label htmlFor="endDate" className="text-sidebar-foreground/70">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="max-w-xs bg-sidebar text-sidebar-foreground border-sidebar-border"
            />
          </div>
        </div>
      )}

      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-primary"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <FileText className="mr-2 h-4 w-4" />
            {label}
          </>
        )}
      </Button>
    </div>
  );
}