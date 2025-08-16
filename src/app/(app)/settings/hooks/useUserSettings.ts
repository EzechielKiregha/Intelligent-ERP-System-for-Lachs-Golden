import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axiosdb from '@/lib/axios';
import { UserData, PendingUser, QUERY_KEYS, tabsForRole, canAccessTab, TabKey } from './types';

/**
 * useUserSettings
 * - Fetches the current user's settings payload
 * - Fetches pending users (for admins)
 * - Exposes helpers for permitted tabs based on role
 *
 * NOTE: This hook assumes the following endpoints exist in your API:
 *  - GET /api/settings/user -> returns UserData
 *  - GET /api/settings/pending-users -> returns PendingUser[] (only accessible to admins)
 */
export function useUserSettings() {
  const { data: session } = useSession();
  const [restrictedTab, setRestrictedTab] = useState<TabKey | null>(null);
  const queryClient = useQueryClient();

  const userQuery = useQuery<UserData | null>({
    queryKey: QUERY_KEYS.userSettings,
    queryFn: async () => {
      const res = await axiosdb.get('/api/settings/user');
      return res.data as UserData;
    },
    enabled: !!session?.user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });

  const pendingUsersQuery = useQuery<PendingUser[]>({
    queryKey: QUERY_KEYS.pendingUsers,
    queryFn: async () => {
      const res = await axiosdb.get('/api/settings/pending-users');
      return res.data as PendingUser[];
    },
    enabled: !!session?.user?.id && (session?.user.role === 'ADMIN' || session?.user.role === 'SUPER_ADMIN'),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  const tabs = useMemo(() => {
    if (!userQuery.data || !session?.user) return ['profile'] as TabKey[];
    return tabsForRole(session.user.role as any, !!userQuery.data.employee);
  }, [userQuery.data, session?.user]);

  const canAccess = (tab: TabKey) => {
    return canAccessTab(tab, (session?.user?.role as any) ?? 'USER', userQuery.data ?? null);
  };

  const handleTabChange = (tab: TabKey) => {
    if (!canAccess(tab)) {
      setRestrictedTab(tab);
      return false;
    }
    return true;
  };

  const refetchAll = async () => {
    await Promise.all([queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.userSettings
    }), queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.pendingUsers
    })]);
  };

  return {
    // session-aware data
    userData: userQuery.data,
    isLoadingUser: userQuery.isLoading,
    isErrorUser: userQuery.isError,

    pendingUsers: pendingUsersQuery.data ?? [],
    isLoadingPendingUsers: pendingUsersQuery.isLoading,
    isErrorPendingUsers: pendingUsersQuery.isError,

    // tabs/helpers
    tabs,
    canAccess,
    restrictedTab,
    openRestrictedTab: (tab: TabKey) => setRestrictedTab(tab),
    closeRestrictedTab: () => setRestrictedTab(null),
    handleTabChange,

    // utilities
    refetchAll,
  } as const;
}
