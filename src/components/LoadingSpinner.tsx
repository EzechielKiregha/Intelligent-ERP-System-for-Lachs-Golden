'use client';

import { useLoading } from '@/contexts/loadingContext';

const LoadingSpinner = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-[#D4AF37] border-gray-200"></div>
    </div>
  );
};

export default LoadingSpinner;