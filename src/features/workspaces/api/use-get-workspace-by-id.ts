"use client"
import axiosdb from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useGetWorkspaceById = (workspaceId: string) => {
  return useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: async () => {
      const { data } = await axiosdb.get(`/api/workspaces/${workspaceId}`);
      return data.data;
    },
    enabled: !!workspaceId,
  });
};
