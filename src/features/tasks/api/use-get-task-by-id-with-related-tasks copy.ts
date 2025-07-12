"use client"
import axiosdb from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useGetTaskByIdWithRelatedTasks = (taskId: string, workspaceId: string) => {
  return useQuery({
    queryKey: ['related-tasks', taskId, workspaceId],
    queryFn: async () => {
      const res = await axiosdb.get(`/api/tasks/get-related-tasks/${taskId}?workspaceId=${workspaceId}`);

      if (res.status === 203) {
        console.error(" Task not found or no related tasks available");
        return []; 
      }

      return res.data;
    },
    enabled: !!taskId && !!workspaceId,
  });
};