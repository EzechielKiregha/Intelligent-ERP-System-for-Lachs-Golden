"use client"

import axiosdb from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';

export const useGetProjects = (workspaceId: string) => {
  return useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: async () => {
      const response = await axiosdb.get(`/api/projects?workspaceId=${workspaceId}`);
      return response.data;
    },
    enabled: !!workspaceId,
  });
};

export const useGetProjectById = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const { data } = await axiosdb.get(`/api/projects/${projectId}`);
      return data.data;
    },
    enabled: !!projectId,
  });
};