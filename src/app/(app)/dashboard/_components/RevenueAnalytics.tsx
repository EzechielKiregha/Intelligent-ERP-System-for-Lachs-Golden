import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

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
  const ranges = ['Last 7 days', 'Last 30 days', 'Last quarter'];

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-lg shadow p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Revenue Analytics</h3>
        <select
          title="Select Date Range"
          value={range}
          onChange={(e) => onRangeChange(e.target.value)}
          className="bg-gray-100 dark:bg-[#374151] text-gray-800 dark:text-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#A17E25] dark:focus:ring-[#D4AF37]"
        >
          {ranges.map((r) => (
            <option key={r} value={r.toLowerCase().replace(/\s+/g, '')}>
              {r}
            </option>
          ))}
        </select>
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
              <span className="ml-1">{item.changePercent > 0 ? `+${item.changePercent}%` : `${item.changePercent}%`}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RevenueAnalytics;