"use client"
import axiosdb from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useGetTaskByIdWithRelatedTasks = (taskId: string, workspaceId: string) => {
  return useQuery({
    queryKey: ['related-tasks', taskId, workspaceId],
    queryFn: async () => {
      const { data } = await axiosdb.get(`/api/tasks/get-related-tasks/${taskId}?workspaceId=${workspaceId}`);
      return data.data;
    },
    enabled: !!taskId && !!workspaceId,
  });
};