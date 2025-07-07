import axiosdb from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const useGetWorkspaces = () => {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const { data } = await axiosdb.get('/api/workspaces');
      return data.data.documents;
    },
  });
};