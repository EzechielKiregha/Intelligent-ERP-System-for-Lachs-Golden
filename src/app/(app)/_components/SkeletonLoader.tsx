import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

interface SkeletonLoaderProps {
  height: number,
  type: 'card' | 'list' | 'grid';
  count?: number; // Number of skeletons to render
  col?: number
}

const SkeletonLoader = ({ height, type, count = 1, col = 3 }: SkeletonLoaderProps) => {
  switch (type) {
    case 'card':
      return (
        <div className={` grid grid-cols-1 sm:grid-cols-${col} gap-4`}>
          {Array.from({ length: count }).map((_, i) => (
            <Skeleton key={i} className={`h-${height} w-full rounded-lg bg-sidebar`} />
          ))}
        </div>
      );
    case 'list':
      return (
        // <div className="animate-pulse bg-gray-200 dark:bg-[#374151] rounded-lg h-12 w-full mb-2"></div>
        <div >
          {Array.from({ length: count }).map((_, i) => (
            <Skeleton key={i} className={`h-${height} w-full rounded-lg bg-sidebar`} />
          ))}
        </div>
      );
    case 'grid':
      return (
        // <div className="animate-pulse bg-gray-200 dark:bg-[#374151] rounded-lg h-24 w-full"></div>
        <div className="">
          {Array.from({ length: count }).map((_, i) => (
            <Skeleton key={i} className={`h-${height} w-full rounded-lg bg-sidebar`} />
          ))}
        </div>
      );
    default:
      return null;
  }

};

export default SkeletonLoader;
