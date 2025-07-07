"use client"
import axiosdb from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useGetProjectAnalytics = (projectId: string, workspaceId: string) => {
  return useQuery({
    queryKey: ['project-analytics', projectId, workspaceId],
    queryFn: async () => {
      const { data } = await axiosdb.get(`/api/projects/${projectId}/analytics?workspaceId=${workspaceId}`);
      return data.data;
    },
    enabled: !!projectId && !!workspaceId,
  });
};