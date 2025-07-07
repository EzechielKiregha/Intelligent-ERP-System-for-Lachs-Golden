import axiosdb from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useGetWorkspaceAnalytics = (workspaceId: string) => {
  return useQuery({
    queryKey: ['workspace-analytics', workspaceId],
    queryFn: async () => {
      const { data } = await axiosdb.get(`/api/workspaces/${workspaceId}/analytics`);
      return data.data;
    },
    enabled: !!workspaceId,
  });
};