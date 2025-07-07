import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export const useGetTasks = (filters: { workspaceId: string; projectId?: string; assigneeId?: string; status?: string; dueDate?: string; search?: string }) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const params = new URLSearchParams(filters).toString();
      const { data } = await axios.get(`/api/tasks?${params}`);
      return data.data;
    },
    enabled: !!filters.workspaceId,
  });
};

export const useGetTaskById = (taskId: string, workspaceId: string) => {
  return useQuery({
    queryKey: ['task', taskId, workspaceId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/tasks/${taskId}?workspaceId=${workspaceId}`);
      return data.data;
    },
    enabled: !!taskId && !!workspaceId,
  });
};

export const useGetTaskByIdWithRelatedTasks = (taskId: string, workspaceId: string) => {
  return useQuery({
    queryKey: ['related-tasks', taskId, workspaceId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/tasks/get-related-tasks/${taskId}?workspaceId=${workspaceId}`);
      return data.data;
    },
    enabled: !!taskId && !!workspaceId,
  });
};


export const useCreateTask = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; projectId: string; assigneeId: string; status: string; dueDate?: string; description?: string }) => {
      const { data: response } = await axios.post('/api/tasks', { ...data, workspaceId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', { workspaceId }] });
    },
  });
};

export const useUpdateTask = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: { name?: string; projectId?: string; assigneeId?: string; status?: string; dueDate?: string; description?: string } }) => {
      const { data: response } = await axios.patch(`/api/tasks/${taskId}`, { ...data, workspaceId });
      return response.data;
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', { workspaceId }] });
      queryClient.invalidateQueries({ queryKey: ['task', taskId, workspaceId] });
    },
  });
};

export const useBulkUpdateTaskPositions = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tasks: { $id: string; status: string; position: number }[]) => {
      const { data } = await axios.post(`/api/tasks/bulk-position-update?workspaceId=${workspaceId}`, { tasks });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', { workspaceId }] });
    },
  });
};

export const useDeleteTask = (workspaceId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const { data } = await axios.delete(`/api/tasks/${taskId}?workspaceId=${workspaceId}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', { workspaceId }] });
    },
  });
};
