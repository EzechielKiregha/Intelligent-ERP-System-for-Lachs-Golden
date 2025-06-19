import { useMutation, useQuery } from '@tanstack/react-query';
import axiosdb from '@/lib/axios';

export function useFinanceSummary() {
  return useQuery({
    queryKey: ['finance', 'summary'],
    queryFn: async () => {
      const { data } = await axiosdb.get('/api/finance/summary');
      return data;
    },
  });
}

export function useFinanceTransactions(page = 1) {
  return useQuery({
    queryKey: ['finance', 'transactions', page],
    queryFn: async () => {
      const { data } = await axiosdb.get(`/api/finance/transactions?page=${page}`);
      return data;
    },
  });
}

export function useFinanceForecast(range = '6m') {
  return useQuery({
    queryKey: ['finance', 'forecast', range],
    queryFn: async () => {
      const { data } = await axiosdb.get(`/api/finance/forecast?range=${range}`);
      return data;
    },
  });
}

export function useBudgetData() {
  return useQuery({
    queryKey: ['finance', 'budget'],
    queryFn: async () => {
      const { data } = await axiosdb.get('/api/finance/budget');
      return data;
    },
  });
}

export function useFinanceInsights() {
  return useQuery({
    queryKey: ['finance', 'insights'],
    queryFn: async () => {
      const { data } = await axiosdb.get('/api/finance/insights');
      return data;
    },
  });
}

export function useExportFinanceReport() {
  return useMutation({
    mutationFn: async (params: any) => {
      const { data } = await axiosdb.post('/api/finance/export', params);
      return data;
    },
  });
}