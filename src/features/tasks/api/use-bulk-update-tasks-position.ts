"use client"
import { PositionedTask } from "@/hooks/type";
import axiosdb from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useBulkUpdateTaskPositions = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tasks: PositionedTask[]) => {
      const { data } = await axiosdb.post(`/api/tasks/bulk-position-update?workspaceId=${workspaceId}`, { tasks });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', { workspaceId }] });
    },
  });
};