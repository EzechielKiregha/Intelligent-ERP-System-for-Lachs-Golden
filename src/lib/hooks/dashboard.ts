import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AxiosInstance from '@/lib/axios';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const { data } = await AxiosInstance.get('/api/dashboard/stats');
      return data;
    },
  });
}

export function useRevenueAnalytics(range: string) {
  return useQuery({
    queryKey: ['dashboard', 'revenue', range],
    queryFn: async () => {
      const { data } = await AxiosInstance.get(`/api/dashboard/revenue?range=${range}`);
      return data;
    },
  });
}

export function useInventorySummary() {
  return useQuery({
    queryKey: ['inventory', 'summary'],
    queryFn: async () => {
      const { data } = await AxiosInstance.get('/api/inventory/summary');
      return data;
    },
  });
}

export function useRecentActivities() {
  return useQuery({
    queryKey: ['activities', 'recent'],
    queryFn: async () => {
      const { data } = await AxiosInstance.get('/api/activities/recent');
      return data;
    },
  });
}

export function useAIInsights() {
  return useQuery({
    queryKey: ['insights'],
    queryFn: async () => {
      const { data } = await AxiosInstance.get('/api/insights');
      return data;
    },
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { type: string; dateRange?: string }) => {
    const { data } = await AxiosInstance.post('/api/reports/generate', params);
    return data;
  },
    onSuccess: () => {
      // Optionally: invalidate or refetch queries
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}