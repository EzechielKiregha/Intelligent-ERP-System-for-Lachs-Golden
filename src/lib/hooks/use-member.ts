// lib/hooks/useMembers.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useGetCurrentMember = (workspaceId: string) => {
  return useQuery({
    queryKey: ['current-member', workspaceId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/members/current?workspaceId=${workspaceId}`);
      return data.data;
    },
    enabled: !!workspaceId,
  });
};

export const useGetMembers = (workspaceId: string) => {
  return useQuery({
    queryKey: ['members', workspaceId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/members?workspaceId=${workspaceId}`);
      return data.data;
    },
    enabled: !!workspaceId,
  });
};

// lib/hooks/useMember.ts
export const useGetMemberById = (memberId: string, workspaceId: string) => {
  return useQuery({
    queryKey: ['member', memberId, workspaceId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/members/${memberId}?workspaceId=${workspaceId}`);
      return data.data;
    },
    enabled: !!memberId && !!workspaceId,
  });
};

// lib/hooks/useRemoveMember.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useDeleteMember = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memberId: string) => {
      const { data } = await axios.delete(`/api/members/${memberId}?workspaceId=${workspaceId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', workspaceId] });
    },
  });
};

// lib/hooks/useUpdateMemberRole.ts
export const useUpdateMemberRole = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: 'ADMIN' | 'MEMBER' }) => {
      const { data } = await axios.patch(`/api/members/${memberId}?workspaceId=${workspaceId}`, { role });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', workspaceId] });
    },
  });
};