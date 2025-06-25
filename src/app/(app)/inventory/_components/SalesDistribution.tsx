import React from 'react';
import { Box, AlertTriangle, Clock } from 'lucide-react';

interface SalesDistributionProps {
  data: {
    totalItems: number;
    lowStock: number;
    pendingOrders: number;
  };
}

const SalesDistribution: React.FC<SalesDistributionProps> = ({ data }) => {
  const items = [
    {
      label: 'Total Items',
      value: data.totalItems,
      icon: <Box className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />,
      status: 'In Stock',
      statusColor: 'text-green-500',
    },
    {
      label: 'Low Stock Items',
      value: data.lowStock,
      icon: <AlertTriangle className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />,
      status: 'Warning',
      statusColor: 'text-amber-500',
    },
    {
      label: 'Pending Orders',
      value: data.pendingOrders,
      icon: <Clock className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />,
      status: 'Processing',
      statusColor: 'text-gray-500 dark:text-gray-400',
    },
  ];

  return (
    <div className="bg-[var(--sidebar)] text-[var(--sidebar-foreground)] rounded-lg shadow p-4">
      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Sales Distribution</h3>

      {/* Items */}
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.label} className="flex items-center justify-between">
            {/* Icon and Label */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FEF3C7] dark:bg-[#3E3E3E] rounded-full">{item.icon}</div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.label}</p>
                <p className="text-base font-bold text-gray-800 dark:text-gray-200">{item.value}</p>
              </div>
            </div>

            {/* Status Badge */}
            <span className={`text-sm font-medium ${item.statusColor}`}>{item.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SalesDistribution;