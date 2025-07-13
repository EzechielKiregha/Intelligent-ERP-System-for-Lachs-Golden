'use client';

import { useLoading } from '@/contexts/loadingContext';

const LoadingSpinner = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-50">
      <div
        className={`h-full bg-sidebar-primary transition-all duration-500 ${isLoading ? 'animate-loading-bar' : 'w-0'
          }`}
      ></div>
    </div>
  );
};

export default LoadingSpinner;