import axiosdb from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// lib/hooks/useUpdateProject.ts
export const useUpdateProject = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string; data: { name?: string; imageUrl?: File | string } }) => {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.imageUrl !== undefined) formData.append('imageUrl', data.imageUrl);
      formData.append('workspaceId', workspaceId);
      const { data: response } = await axiosdb.patch(`/api/projects/${projectId}`, formData);
      return response.data;
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
};