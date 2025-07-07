import axiosdb from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateTask = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; projectId: string; assigneeId: string; status: string; dueDate?: Date; description?: string }) => {
      const { data: response } = await axiosdb.post('/api/tasks', { ...data, workspaceId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', { workspaceId }] });
    },
  });
};