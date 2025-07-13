'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import BasePopover from '@/components/BasePopover';
import { Button } from '@/components/ui/button';

const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const isHome = pathname.match(/^\/$/);
  const isWorkspaceJoin = pathname.match(/^\/workspaces\/([^/]+)\/join\/([^/]+)$/);

  useEffect(() => {
    if (status === 'unauthenticated') {
      setShowWarning(true);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            // Redirect to login with query params if accessing workspace join route
            if (isWorkspaceJoin) {
              const [, wsId, inviteCode] = pathname.match(/^\/workspaces\/([^/]+)\/join\/([^/]+)$/) || [];
              router.push(`/login?join-ws=true&wsId=${wsId}&inviteCode=${inviteCode}`);
            } else {
              router.push('/login');
            }
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval); // Cleanup interval on unmount
    }
  }, [status, router, pathname, isWorkspaceJoin]);

  if (isHome) {
    return <>{children}</>;
  }

  if (status === 'loading') {
    return (
      <div className="fixed top-0 left-0 w-full h-1 bg-transparent z-50">
        <div
          className={`h-full bg-sidebar-primary transition-all duration-500 ${status === 'loading' ? 'animate-loading-bar' : 'w-0'
            }`}
        ></div>
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
          <p className="text-gray-800 mb-4 dark:text-gray-200">
            You are not authenticated. Redirecting to the login page in {countdown} seconds.
          </p>
          <Button
            onClick={() => {
              if (isWorkspaceJoin) {
                const [, wsId, inviteCode] = pathname.match(/^\/workspaces\/([^/]+)\/join\/([^/]+)$/) || [];
                router.push(`/login?join-ws=true&wsId=${wsId}&inviteCode=${inviteCode}`);
              } else {
                router.push('/login');
              }
            }}
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