import axiosdb from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// lib/hooks/useDeleteProject.ts
export const useDeleteProject = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => {
      const { data } = await axiosdb.delete(`/api/projects/${projectId}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
    },
  });
};