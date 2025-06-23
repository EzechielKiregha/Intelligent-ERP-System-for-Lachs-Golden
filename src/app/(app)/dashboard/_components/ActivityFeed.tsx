import React from 'react';
import { CheckCircle, UserPlus, Truck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface Activity {
  id: string;
  type: 'order' | 'registration' | 'shipment' | 'alert';
  message: string;
  timestamp: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <CheckCircle className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />;
      case 'registration':
        return <UserPlus className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />;
      case 'shipment':
        return <Truck className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />;
      case 'alert':
        return <AlertTriangle className="w-6 h-6 text-[#A17E25] dark:text-[#D4AF37]" />;
      default:
        return null;
    }
  };

  const timeAgo = (timestamp: string) => {
    const time = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - time.getTime()) / 1000); // Difference in seconds

    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  return (
    <div className="bg-[var(--sidebar)] text-[var(--sidebar-foreground)] rounded-lg shadow p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Recent Activities</h3>
        <Link
          href="/finance/transactions"
          className="text-sm text-[#A17E25] hover:underline dark:text-[#D4AF37]"
        >
          View All
        </Link>
      </div>

      {/* Activity List */}
      <ul className="space-y-3">
        {activities.map((activity) => (
          <li
            key={activity.id}
            className="flex items-center bg-gray-50 dark:bg-[#1F2A3A] rounded-lg p-3"
          >
            {/* Icon */}
            <div className="p-2 bg-white/30 dark:bg-white/20 rounded-full">
              {getIcon(activity.type)}
            </div>

            {/* Content */}
            <div className="ml-3">
              <p className="text-sm text-gray-800 dark:text-gray-200">{activity.message}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(activity.timestamp)}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityFeed;