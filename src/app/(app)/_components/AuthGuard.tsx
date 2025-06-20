'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import BasePopover from '@/components/BasePopover';
import { Button } from '@/components/ui/button';

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setShowWarning(true);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            router.push('/login');
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-[#0f1522] bg-opacity-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-[#80410e] dark:border-t-[#D4AF37] border-gray-900 dark:border-gray-200"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <BasePopover
        title="Authentication Required"
        buttonLabel=""
        isOpen={showWarning}
        onClose={() => setShowWarning(false)}
      >
        <div className="text-center">
          <p className="text-gray-800 mb-4">
            You are not authenticated. Redirecting to the login page in {countdown} seconds.
          </p>
          <Button
            onClick={() => router.push('/login')}
            className="bg-gradient-to-l mt-3.5 mx-auto from-[#80410e] to-[#c56a03] hover:bg-[#8C6A1A] dark:from-[#80410e] dark:to-[#b96c13] dark:hover:bg-[#BFA132] text-white rounded-lg py-2 disabled:opacity-50"
          >
            Go to Login
          </Button>
        </div>
      </BasePopover>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;