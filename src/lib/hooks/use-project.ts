// lib/hooks/useProjects.ts
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useGetProjects = (workspaceId: string) => {
  return useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/projects?workspaceId=${workspaceId}`);
      return data.data.documents;
    },
    enabled: !!workspaceId,
  });
};

// lib/hooks/useProject.ts
export const useProject = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/projects/${projectId}`);
      return data.data;
    },
    enabled: !!projectId,
  });
};

// lib/hooks/useCreateProject.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreateProject = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; imageUrl?: File | string }) => {
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.imageUrl) formData.append('imageUrl', data.imageUrl);
      formData.append('workspaceId', workspaceId);
      const { data: response } = await axios.post('/api/projects', formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
    },
  });
};

// lib/hooks/useUpdateProject.ts
export const useUpdateProject = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string; data: { name?: string; imageUrl?: File | string } }) => {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.imageUrl !== undefined) formData.append('imageUrl', data.imageUrl);
      formData.append('workspaceId', workspaceId);
      const { data: response } = await axios.patch(`/api/projects/${projectId}`, formData);
      return response.data;
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
};

// lib/hooks/useDeleteProject.ts
export const useDeleteProject = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      const { data } = await axios.delete(`/api/projects/${projectId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
    },
  });
};

// lib/hooks/useProjectAnalytics.ts
export const useGetProjectAnalytics = (projectId: string, workspaceId: string) => {
  return useQuery({
    queryKey: ['project-analytics', projectId, workspaceId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/projects/${projectId}/analytics?workspaceId=${workspaceId}`);
      return data.data;
    },
    enabled: !!projectId && !!workspaceId,
  });
};