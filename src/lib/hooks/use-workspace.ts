import { useQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const useGetWorkspaces = () => {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const { data } = await axios.get('/api/workspaces');
      return data.data.documents;
    },
  });
};

export const useGetWorkspaceById = (workspaceId: string) => {
  return useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/workspaces/${workspaceId}`);
      return data.data;
    },
    enabled: !!workspaceId,
  });
};

export const useCreateWorkspaces = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; imageUrl?: File | string; companyId: string }) => {
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.imageUrl) formData.append('imageUrl', data.imageUrl);
      formData.append('companyId', data.companyId);
      const { data: response } = await axios.post('/api/workspaces', formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};

export const useUpdateWorkspace = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name?: string; imageUrl?: File | string }) => {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.imageUrl) formData.append('imageUrl', data.imageUrl);
      const { data: response } = await axios.patch(`/api/workspaces/${workspaceId}`, formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
    },
  });
};

export const useDeleteWorkspace = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await axios.delete(`/api/workspaces/${workspaceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};

export const useWorkspaceResetInviteCode = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(`/api/workspaces/${workspaceId}/reset-invite-code`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
    },
  });
};

export const useJoinWorkspace = (workspaceId: string, inviteCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(`/api/workspaces/${workspaceId}/join/${inviteCode}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};

export const useGetWorkspaceAnalytics = (workspaceId: string) => {
  return useQuery({
    queryKey: ['workspace-analytics', workspaceId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/workspaces/${workspaceId}/analytics`);
      return data.data;
    },
    enabled: !!workspaceId,
  });
};