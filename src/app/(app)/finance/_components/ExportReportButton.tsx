import React from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';

interface ExportReportButtonProps {
  type: 'transactions' | 'revenue' | 'expenses';
}

export default function ExportReportButton({ type }: ExportReportButtonProps) {
  const [dateRange, setDateRange] = React.useState<'last7days' | 'last30days' | 'lastquarter' | 'custom'>('last7days');
  const [customStart, setCustomStart] = React.useState('');
  const [customEnd, setCustomEnd] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGenerate = async () => {
    let params = new URLSearchParams();
    params.set('type', type);
    if (dateRange === 'custom') {
      if (!customStart || !customEnd) {
        toast.error('Select both start and end dates');
        return;
      }
      if (new Date(customStart) > new Date(customEnd)) {
        toast.error('Start date cannot be after end date');
        return;
      }
      params.set('dateRange', 'custom');
      params.set('startDate', customStart);
      params.set('endDate', customEnd);
    } else {
      params.set('dateRange', dateRange);
    }
    const url = `/api/finance/reports/generate?${params.toString()}`;
    setIsGenerating(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to generate');
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = `report_${type}_${customStart || dateRange}.csv`; // or match filename from headers
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(href);
    } catch (e) {
      console.error(e);
      toast.error('Export failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-2 bg-sidebar">
      {/* Select date range */}
      <div className="flex items-center gap-2">
        <Label>Range:</Label>
        <Select value={dateRange} onValueChange={(value) => setDateRange(value as any)}>
          <SelectTrigger className="w-48 bg-sidebar-accent text-sidebar-accent-foreground">
            <SelectValue placeholder="Select Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last7days">Last 7 days</SelectItem>
            <SelectItem value="last30days">Last 30 days</SelectItem>
            <SelectItem value="lastquarter">Last quarter</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {dateRange === 'custom' && (
        <div className="flex items-end gap-4 bg-sidebar">
          <div className="flex flex-col">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <div className="flex flex-col">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>
      )}

      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="flex items-center space-x-2 bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-primary"
      >
        <FileText className="w-5 h-5" />
        <span>{isGenerating ? 'Generating...' : 'Export Report'}</span>
      </Button>
    </div>
  );
}