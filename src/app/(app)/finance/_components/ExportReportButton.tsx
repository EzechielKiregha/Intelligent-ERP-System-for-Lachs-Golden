import React from 'react';
import { FileText } from 'lucide-react';
import { useExportFinanceReport } from '@/lib/hooks/finance';

interface ExportReportButtonProps {
  type: string; // e.g., 'summary', 'transactions', 'forecast'
  dateRange: string; // e.g., 'last7days', 'last30days', 'lastquarter'
}

const ExportReportButton: React.FC<ExportReportButtonProps> = ({ type, dateRange }) => {
  const { mutate: exportReport, status } = useExportFinanceReport();
  const isLoading = status === 'pending';

  const handleExport = () => {
    exportReport(
      { type, dateRange },
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
          Export Report
        </span>
      )}
    </button>
  );
};

export default ExportReportButton;