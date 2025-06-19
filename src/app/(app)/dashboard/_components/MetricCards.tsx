import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  delta?: string; // e.g., "+24%", "-3%"
  deltaType?: 'increase' | 'decrease';
  subtitle?: string; // e.g., "vs last month", "Active orders"
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, title, value, delta, deltaType, subtitle }) => {
  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-lg shadow p-4 flex items-center justify-between">
      {/* Icon */}
      <div className="p-2 bg-[#FEF3C7] dark:bg-[#3E3E3E] rounded-full">
        {icon}
      </div>

      {/* Metric Info */}
      <div className="flex-1 ml-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
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

export default MetricCard;