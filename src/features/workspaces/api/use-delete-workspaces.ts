import axiosdb from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (workspaceId: string) => {
      await axiosdb.delete(`/api/workspaces/${workspaceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
    },
  });
};