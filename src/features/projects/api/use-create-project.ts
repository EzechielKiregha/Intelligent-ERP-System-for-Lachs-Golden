"use client"

import axiosdb from '@/lib/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreateProject = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; imageUrl?: File | string }) => {
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.imageUrl) formData.append('imageUrl', data.imageUrl);
      formData.append('workspaceId', workspaceId);
      const { data: response } = await axiosdb.post('/api/projects', formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
    },
  });
};