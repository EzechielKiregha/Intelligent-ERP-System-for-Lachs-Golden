import axiosdb from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// lib/hooks/useUpdateMemberRole.ts
export const useUpdateMemberRole = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: 'ADMIN' | 'MEMBER' }) => {
      const { data } = await axiosdb.patch(`/api/members/${memberId}?workspaceId=${workspaceId}`, { role });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', workspaceId] });
    },
  });
};