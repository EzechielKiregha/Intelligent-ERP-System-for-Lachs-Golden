"use client"
import axiosdb from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateWorkspace = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name?: string; imageUrl?: File | string }) => {
      const formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.imageUrl) formData.append('imageUrl', data.imageUrl);
      const { data: response } = await axiosdb.patch(`/api/workspaces/${workspaceId}`, formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
    },
  });
};