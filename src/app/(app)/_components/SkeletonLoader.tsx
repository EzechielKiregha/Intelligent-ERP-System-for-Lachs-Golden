import React from 'react';

interface SkeletonLoaderProps {
  type: 'card' | 'list' | 'grid';
  count?: number; // Number of skeletons to render
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type, count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="animate-pulse bg-gray-200 dark:bg-[#374151] rounded-lg h-24 w-full mb-4"></div>
        );
      case 'list':
        return (
          <div className="animate-pulse bg-gray-200 dark:bg-[#374151] rounded-lg h-12 w-full mb-2"></div>
        );
      case 'grid':
        return (
          <div className="animate-pulse bg-gray-200 dark:bg-[#374151] rounded-lg h-24 w-full"></div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </div>
  );
};

export default SkeletonLoader;