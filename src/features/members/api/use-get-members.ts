import axiosdb from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useGetMembers = (workspaceId: string) => {
  return useQuery({
    queryKey: ['members', workspaceId],
    queryFn: async () => {
      const { data } = await axiosdb.get(`/api/members?workspaceId=${workspaceId}`);
      return data.data;
    },
    enabled: !!workspaceId,
  });
};