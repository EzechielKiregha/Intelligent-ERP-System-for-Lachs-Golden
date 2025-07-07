"use client"

import axiosdb from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';

export const useGetCurrentMember = (workspaceId: string) => {
  return useQuery({
    queryKey: ['current-member', workspaceId],
    queryFn: async () => {
      const { data } = await axiosdb.get(`/api/members/current?workspaceId=${workspaceId}`);
      return data.data;
    },
    enabled: !!workspaceId,
  });
};