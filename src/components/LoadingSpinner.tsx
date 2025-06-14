'use client'

import { useLoading } from "@/contexts/loadingContext";


const LoadingSpinner = () => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* Spinner: use ShadcnUI or custom */}
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-primary border-gray-200"></div>
      {/* 
      - `border-t-primary` uses your theme’s primary color; adjust in tailwind.config if needed.
      - size/h styling can match your design tokens.
    */}
    </div>
  );
};

export default LoadingSpinner;