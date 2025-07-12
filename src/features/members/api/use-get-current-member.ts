"use client"

import axiosdb from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';

export const useGetCurrentMember = (workspaceId: string) => {
  return useQuery({
    queryKey: ['current-member', workspaceId],
    queryFn: async () => {
      const res = await axiosdb.get(`/api/members/current?workspaceId=${workspaceId}`);
      // console.log('Current member data:', data);
      return res.data.member;
    },
    enabled: !!workspaceId,
  });
};