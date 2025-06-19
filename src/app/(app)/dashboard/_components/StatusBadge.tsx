import React from 'react';
import { CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'active' | 'pending' | 'completed' | 'error';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeDetails = (status: string) => {
    switch (status) {
      case 'active':
        return {
          color: 'bg-green-100 text-green-600',
          icon: <CheckCircle className="w-4 h-4 text-green-600" />,
          label: 'Active',
        };
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-600',
          icon: <Clock className="w-4 h-4 text-yellow-600" />,
          label: 'Pending',
        };
      case 'completed':
        return {
          color: 'bg-blue-100 text-blue-600',
          icon: <CheckCircle className="w-4 h-4 text-blue-600" />,
          label: 'Completed',
        };
      case 'error':
        return {
          color: 'bg-red-100 text-red-600',
          icon: <XCircle className="w-4 h-4 text-red-600" />,
          label: 'Error',
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-600',
          icon: <AlertTriangle className="w-4 h-4 text-gray-600" />,
          label: 'Unknown',
        };
    }
  };

  const { color, icon, label } = getBadgeDetails(status);

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${color}`}>
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};

export default StatusBadge;