// lib/hooks/useRemoveMember.ts
import axiosdb from '@/lib/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useDeleteMember = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memberId: string) => {
      const { data } = await axiosdb.delete(`/api/members/${memberId}?workspaceId=${workspaceId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', workspaceId] });
    },
  });
};