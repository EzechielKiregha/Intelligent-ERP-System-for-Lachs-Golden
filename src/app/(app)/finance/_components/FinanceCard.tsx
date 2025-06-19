import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface FinanceCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta?: string; // e.g., "+24%", "-3%"
  deltaType?: 'increase' | 'decrease';
  tooltip?: string; // Optional tooltip for additional info
}

const FinanceCard: React.FC<FinanceCardProps> = ({ icon, label, value, delta, deltaType, tooltip }) => {
  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-lg shadow p-4 flex items-center justify-between">
      {/* Icon */}
      <div className="p-2 bg-[#FEF3C7] dark:bg-[#3E3E3E] rounded-full">
        {icon}
      </div>

      {/* Metric Info */}
      <div className="flex-1 ml-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</h3>
        <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
        {tooltip && <p className="text-xs text-gray-500 dark:text-gray-400">{tooltip}</p>}
      </div>

      {/* Delta */}
      {delta && (
        <div className={`flex items-center text-sm ${deltaType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
          {deltaType === 'increase' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          <span className="ml-1">{delta}</span>
        </div>
      )}
    </div>
  );
};

export default FinanceCard;