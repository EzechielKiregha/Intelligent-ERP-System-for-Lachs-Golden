import { TASK_STATUS } from '@/hooks/type';
import axiosdb from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';

export const useGetTasks = (filters: { workspaceId: string; projectId?: string; assigneeId?: string; status?: TASK_STATUS; dueDate?: string; search?: string }) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters).toString();
      const { data } = await axiosdb.get(`/api/tasks?${params}`);
      return data.data;
    },
    enabled: !!filters.workspaceId,
  });
};