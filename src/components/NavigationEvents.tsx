// components/NavigationEvents.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLoading } from '@/contexts/loadingContext';
import { Suspense } from 'react';

export function NavigationEventsWrapper() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-[#A17E25] dark:border-t-[#D4AF37] border-gray-200"></div>
      </div>
    }>
      <NavigationEvents />
    </Suspense>
  );
}

function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setIsLoading } = useLoading();

  useEffect(() => {
    const url = pathname + searchParams.toString();
    setIsLoading(false);
    console.log('Route changed to: ', url);
  }, [pathname, searchParams, setIsLoading]);

  return null;
}