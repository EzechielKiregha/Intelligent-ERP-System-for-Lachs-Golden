"use client"
import axiosdb from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteTask = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string | undefined) => {
      const { data } = await axiosdb.delete(`/api/tasks/${taskId}?workspaceId=${workspaceId}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', { workspaceId }] });
    },
  });
};