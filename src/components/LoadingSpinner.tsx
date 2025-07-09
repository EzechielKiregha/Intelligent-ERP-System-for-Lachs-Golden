'use client';

import { useLoading } from '@/contexts/loadingContext';

const LoadingSpinner = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-50">
      <div className="h-full bg-amber-700 animate-loading-bar"></div>
    </div>
  );
};

export default LoadingSpinner;