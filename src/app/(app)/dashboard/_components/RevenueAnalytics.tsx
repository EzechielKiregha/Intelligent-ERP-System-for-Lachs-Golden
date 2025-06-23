import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RevenueAnalyticsProps {
  data: {
    quarter: string;
    revenue: number;
    changePercent: number;
  }[];
  range: string;
  onRangeChange: (range: string) => void;
}

const RevenueAnalytics: React.FC<RevenueAnalyticsProps> = ({ data, range, onRangeChange }) => {
  const ranges = [
    { label: 'Last 7 days', value: 'last7days' },
    { label: 'Last 30 days', value: 'last30days' },
    { label: 'Last quarter', value: 'lastquarter' },
  ];

  if (!data || data.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">No revenue data available for the selected range.</p>;
  }

  return (
    <div className="bg-[var(--sidebar)] text-[var(--sidebar-foreground)] rounded-lg shadow p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Revenue Analytics</h3>
        <Select
          value={range}
          onValueChange={(value) => onRangeChange(value)}
        >
          <SelectTrigger className="w-48 bg-sidebar-accent text-sidebar-accent-foreground">
            <SelectValue placeholder="Select Date Range" />
          </SelectTrigger>
          <SelectContent>
            {ranges.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Revenue Data */}
      <ul className="space-y-2">
        {data.map((item) => (
          <li key={item.quarter} className="flex justify-between items-center py-2">
            {/* Quarter and Revenue */}
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.quarter}</p>
              <p className="text-base font-medium text-gray-800 dark:text-gray-200">
                ${item.revenue.toLocaleString()}
              </p>
            </div>

            {/* Change Percent */}
            <div
              className={`flex items-center text-sm ${item.changePercent > 0 ? 'text-green-500' : 'text-red-500'
                }`}
            >
              {item.changePercent > 0 ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              <span className="ml-1">
                {item.changePercent > 0 ? `+${item.changePercent}%` : `${item.changePercent}%`}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RevenueAnalytics;