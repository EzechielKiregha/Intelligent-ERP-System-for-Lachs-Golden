'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLoading } from '@/contexts/loadingContext';
import { Suspense } from 'react';

export function NavigationEventsWrapper() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-[#A17E25] dark:border-t-[#D4AF37] border-gray-200"></div>
        </div>
      }
    >
      <NavigationEvents />
    </Suspense>
  );
}

function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setIsLoading } = useLoading();
  const previousUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const currentUrl = pathname + '?' + searchParams.toString();

    // Only log and update loading state if the URL has changed
    if (previousUrlRef.current !== currentUrl) {
      setIsLoading(true); // Trigger loading state
      console.log('Route changed to: ', currentUrl);
      previousUrlRef.current = currentUrl;

      // Simulate loading completion after a short delay
      const timeout = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timeout); // Cleanup timeout
    }
  }, [pathname, searchParams, setIsLoading]);

  return null;
}