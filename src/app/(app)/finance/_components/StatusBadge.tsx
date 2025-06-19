import React from 'react';

interface StatusBadgeProps {
  status: string; // PENDING, COMPLETED, FAILED
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let badgeColor = '';
  let badgeText = '';

  switch (status) {
    case 'PENDING':
      badgeColor = 'bg-yellow-500 text-white';
      badgeText = 'Pending';
      break;
    case 'COMPLETED':
      badgeColor = 'bg-green-500 text-white';
      badgeText = 'Completed';
      break;
    case 'FAILED':
      badgeColor = 'bg-red-500 text-white';
      badgeText = 'Failed';
      break;
    default:
      badgeColor = 'bg-gray-500 text-white';
      badgeText = 'Unknown';
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badgeColor}`}>
      {badgeText}
    </span>
  );
};

export default StatusBadge;