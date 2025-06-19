import React from 'react';
import { Calendar, ChevronDown, FileText } from 'lucide-react';
import { useExportFinanceReport } from '@/lib/hooks/finance';

export default function FilterToolbar() {
  const { mutate: exportReport, status } = useExportFinanceReport();
  const isLoading = status === 'pending';

  const handleExport = () => {
    exportReport(
      { type: 'summary', dateRange: 'last30days' },
      {
        onSuccess: () => {
          alert('Report exported successfully!');
        },
        onError: () => {
          alert('Failed to export report.');
        },
      }
    );
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-lg shadow p-4 flex items-center justify-between">
      {/* Date Range Picker */}
      <div className="flex items-center space-x-2">
        <Calendar className="w-5 h-5 text-gray-800 dark:text-gray-200" />
        <select
          title='Select Date Range'
          className="bg-gray-100 dark:bg-[#374151] text-gray-800 dark:text-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#A17E25] dark:focus:ring-[#D4AF37]"
        >
          <option value="last7days">Last 7 Days</option>
          <option value="last30days">Last 30 Days</option>
          <option value="lastquarter">Last Quarter</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      {/* Category Dropdown */}
      <div className="flex items-center space-x-2">
        <ChevronDown className="w-5 h-5 text-gray-800 dark:text-gray-200" />
        <select
          title='Select Category'
          className="bg-gray-100 dark:bg-[#374151] text-gray-800 dark:text-gray-200 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#A17E25] dark:focus:ring-[#D4AF37]"
        >
          <option value="all">All Categories</option>
          <option value="marketing">Marketing</option>
          <option value="hr">HR</option>
          <option value="logistics">Logistics</option>
          <option value="development">Development</option>
        </select>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isLoading}
        className={`px-4 py-2 rounded-lg shadow ${isLoading
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-[#A17E25] hover:bg-[#8C6A1A] text-white'
          }`}
      >
        {isLoading ? (
          <span className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Exporting...
          </span>
        ) : (
          <span className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Export CSV
          </span>
        )}
      </button>
    </div>
  );
}