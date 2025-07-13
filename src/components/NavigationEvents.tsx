'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLoading } from '@/contexts/loadingContext';
import { Suspense } from 'react';

// Top Bar Loading Component
function TopBarLoading({ isLoading }: { isLoading: boolean }) {
  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-50">
      <div
        className={`h-full bg-sidebar-primary transition-all duration-500 ${isLoading ? 'animate-loading-bar' : 'w-0'
          }`}
      ></div>
    </div>
  );
}

// Navigation Events Wrapper
export function NavigationEventsWrapper() {
  const { isLoading } = useLoading();
  return (
    <>
      <TopBarLoading isLoading={isLoading} />
      <Suspense fallback={null}>
        <NavigationEvents />
      </Suspense>
    </>
  );
}

function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setIsLoading } = useLoading();
  const previousUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const currentUrl = pathname + '?' + searchParams.toString();

    if (previousUrlRef.current !== currentUrl) {
      setIsLoading(true);
      console.log('Route changed to: ', currentUrl);
      previousUrlRef.current = currentUrl;

      // Simulate loading completion after a delay
      const timeout = setTimeout(() => setIsLoading(false), 800); // Adjusted duration for smoother sync
      return () => clearTimeout(timeout);
    }
  }, [pathname, searchParams, setIsLoading]);

  return null;
}