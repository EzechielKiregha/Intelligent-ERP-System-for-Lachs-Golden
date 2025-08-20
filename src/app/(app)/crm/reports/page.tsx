// app/crm/reports/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, BarChart3, PieChart, FileText, Calendar } from 'lucide-react';
import { useState } from 'react';
import { useGenerateReport } from '@/lib/hooks/dashboard';
import { toast } from 'sonner';

const REPORT_TYPES = [
  {
    id: 'sales-performance',
    name: 'Sales Performance',
    description: 'Track deal conversion rates and sales metrics',
    icon: BarChart3
  },
  {
    id: 'pipeline-analysis',
    name: 'Pipeline Analysis',
    description: 'Analyze deal stages and identify bottlenecks',
    icon: PieChart
  },
  {
    id: 'contact-engagement',
    name: 'Contact Engagement',
    description: 'Measure contact interaction and follow-up effectiveness',
    icon: FileText
  },
  {
    id: 'forecast-report',
    name: 'Sales Forecast',
    description: 'Predict future revenue based on current pipeline',
    icon: Calendar
  }
];

export default function CRMReportsPage() {
  const [dateRange, setDateRange] = useState('last30days');
  const generateReport = useGenerateReport();

  const handleGenerateReport = (type: string) => {
    generateReport.mutate(
      {
        type: `crm-${type}`,
        dateRange
      },
      {
        onSuccess: () => {
          toast.success('Report generated successfully');
        },
        onError: () => {
          toast.error('Failed to generate report');
        }
      }
    );
  };

  return (
    <div className="flex flex-col min-h-full">
      <h1 className="text-2xl font-semibold text-sidebar-foreground mb-6">CRM Reports</h1>

      <div className="mb-6 flex justify-between items-center">
        <div>
          <label htmlFor="dateRange" className="text-sm text-sidebar-foreground/70 mr-2">
            Date Range:
          </label>
          <select
            id="dateRange"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="p-2 border border-[var(--sidebar-border)] rounded bg-sidebar text-sidebar-foreground"
          >
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="lastquarter">Last Quarter</option>
            <option value="lastyear">Last Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {REPORT_TYPES.map((report) => (
          <Card key={report.id} className="bg-sidebar border-[var(--sidebar-border)] hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center">
                <report.icon className="h-5 w-5 text-sidebar-accent mr-2" />
                <CardTitle className="text-sidebar-foreground">{report.name}</CardTitle>
              </div>
              <p className="text-sm text-sidebar-foreground/70 mt-1">{report.description}</p>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleGenerateReport(report.id)}
                disabled={generateReport.isPending}
              >
                <Download className="mr-2 h-4 w-4" />
                {generateReport.isPending ? 'Generating...' : 'Generate Report'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Card className="bg-sidebar border-[var(--sidebar-border)]">
          <CardHeader>
            <CardTitle className="text-sidebar-foreground">Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-sidebar-accent/10 rounded">
                <div>
                  <h3 className="font-medium text-sidebar-foreground">Monthly Sales Performance</h3>
                  <p className="text-sm text-sidebar-foreground/70">Generated on Apr 10, 2024</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>

              <div className="flex justify-between items-center p-3 bg-sidebar-accent/10 rounded">
                <div>
                  <h3 className="font-medium text-sidebar-foreground">Q2 Pipeline Analysis</h3>
                  <p className="text-sm text-sidebar-foreground/70">Generated on Apr 3, 2024</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}