import React from 'react';
import { TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

interface Insight {
  id: string;
  title: string;
  description: string;
  iconType: 'analytics' | 'risk' | 'growth';
}

interface AIInsightsProps {
  insights: Insight[];
  onGenerateReport: () => void;
  isGenerating?: boolean;
}

const AIInsights: React.FC<AIInsightsProps> = ({ insights, onGenerateReport, isGenerating }) => {
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'analytics':
        return <TrendingUp className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />;
      case 'risk':
        return <AlertTriangle className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />;
      case 'growth':
        return <Lightbulb className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-[var(--sidebar)] text-[var(--sidebar-foreground)] rounded-lg shadow p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">AI-Driven Insights</h3>
        <button
          onClick={onGenerateReport}
          disabled={isGenerating}
          className={`px-4 py-2 rounded-lg shadow ${isGenerating
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-sidebar-accent text-sidebar-accent-foreground'
            }`}
        >
          {isGenerating ? (
            <span className="flex items-center">
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
              Generating...
            </span>
          ) : (
            'Generate Report'
          )}
        </button>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.isArray(insights) && insights.map((insight) => (
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
};

export default AIInsights;