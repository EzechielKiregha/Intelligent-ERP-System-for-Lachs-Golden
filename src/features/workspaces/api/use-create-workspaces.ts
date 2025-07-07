"use client"
import axiosdb from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateWorkspaces = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; imageUrl?: File | string; companyId: string }) => {
      const formData = new FormData();
      formData.append('name', data.name);
      if (data.imageUrl) formData.append('imageUrl', data.imageUrl);
      formData.append('companyId', data.companyId);
      const { data: response } = await axiosdb.post('/api/workspaces', formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};