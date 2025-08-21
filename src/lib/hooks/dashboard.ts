import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosdb from '@/lib/axios';
import { toast } from 'sonner';

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  revPercentage: number;
  orderPercentage: number;
  customerPercentage: number;
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const { data } = await axiosdb.get('/api/dashboard/stats');
      return data;
    },
  });
}

export function useRevenueAnalytics(range: string) {
  return useQuery({
    queryKey: ['dashboard', 'revenue', range],
    queryFn: async () => {
      const { data } = await axiosdb.get(`/api/dashboard/revenue?range=${range}`);
      return data;
    },
  });
}

export function useRecentActivities() {
  return useQuery({
    queryKey: ['activities', 'recent'],
    queryFn: async () => {
      const { data } = await axiosdb.get('/api/activities/recent');
      return data;
    },
  });
}

export function useAIInsights() {
  return useQuery({
    queryKey: ['insights'],
    queryFn: async () => {
      const { data } = await axiosdb.get('/api/insights');
      return data;
    },
  });
}

export function useGenerateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { type: string; dateRange?: string }) => {
    const { data } = await axiosdb.post('/api/reports/generate', params);
    return data;
  },
    onSuccess: () => {
      // Optionally: invalidate or refetch queries
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });
}

export function useGenerateReportAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { type: string; dateRange?: string }) => {
      // Call the specific report endpoint based on type
      const response = await fetch(`/api/reports/${params.type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateRange: params.dateRange })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }
      
      // Handle the PDF download directly
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${params.type}-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      
      return true;
    },
    onSuccess: () => {
      toast.success('Report downloaded successfully');
      queryClient.invalidateQueries({ queryKey: ['auditLog'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to generate report: ${error.message}`);
    },
  });
}

export function useAuditLog() {
  return useQuery({
    queryKey: ['auditLog'],
    queryFn: async () => {
      const response = await fetch('/api/audit-log');
      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }
      return response.json();
    },
  });
}