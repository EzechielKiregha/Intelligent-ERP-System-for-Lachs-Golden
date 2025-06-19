import React from 'react';
import { TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { useFinanceInsights } from '@/lib/hooks/finance';

interface Insight {
  id: string;
  title: string;
  description: string;
  iconType: 'spike' | 'pattern' | 'deadline';
}

export default function FinancialInsights() {
  const { data, isLoading, isError } = useFinanceInsights();

  if (isLoading) {
    return <p>Loading financial insights...</p>;
  }

  if (isError) {
    return <p>Error loading financial insights.</p>;
  }

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'spike':
        return <TrendingUp className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />;
      case 'pattern':
        return <AlertTriangle className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />;
      case 'deadline':
        return <Calendar className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Financial Insights</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((insight: Insight) => (
          <div
            key={insight.id}
            className="bg-[#FEF9C3] dark:bg-[#3E3E3E] rounded-lg p-4 flex items-start"
          >
            {/* Icon */}
            <div className="p-2 bg-[#FEF3C7] dark:bg-[#3E3E3E] rounded-full">
              {getIcon(insight.iconType)}
            </div>

            {/* Content */}
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{insight.title}</p>
              <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">{insight.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}