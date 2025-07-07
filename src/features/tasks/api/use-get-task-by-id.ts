"use client"
import axiosdb from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useGetTaskById = (taskId: string, workspaceId: string) => {
  return useQuery({
    queryKey: ['task', taskId, workspaceId],
    queryFn: async () => {
      const { data } = await axiosdb.get(`/api/tasks/${taskId}?workspaceId=${workspaceId}`);
      return data.data;
    },
    enabled: !!taskId && !!workspaceId,
  });
};