"use client"

import axiosdb from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateTask = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string | undefined; data: {
      $id?: string;
      name: string;
      projectId: string;
      assigneeId: string;
      status: string;
      dueDate: Date;
      description?: string;
  } }) => {
      const { data: response } = await axiosdb.patch(`/api/tasks/${taskId}`, { ...data, workspaceId });
      return response.data;
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', { workspaceId }] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId, workspaceId] });
    },
  });
};