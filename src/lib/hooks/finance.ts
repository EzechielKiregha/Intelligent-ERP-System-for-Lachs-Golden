"use client"
import { useMutation,useQueryClient, useQuery } from '@tanstack/react-query';
import axiosdb from '@/lib/axios';
import toast from 'react-hot-toast';

interface SummaryPeriodResponse {
  totalRevenue: number;
  prevRevenue: number;
  totalExpenses: number;
  prevExpenses: number;
  netProfit: number;
  prevNetProfit: number;
  period: string;
  ranges: {
    currStart: string;
    currEnd: string;
    prevStart: string;
    prevEnd: string;
  };
}

// period: 'month' | 'week' | 'year' | undefined (defaults to month)
export function useFinanceSummaryPeriod(period?: 'month'|'week'|'year') {

  return useQuery<SummaryPeriodResponse, Error>(
    {
    queryKey : ['finance', 'summary', { period }],
    queryFn : async () => {
      const params = new URLSearchParams();
      if (period) params.set('period', period);
      const { data } = await axiosdb.get<SummaryPeriodResponse>(`/api/finance/summary?${params.toString()}`);
      return data;
    },
    }
  );
}

interface Transaction {
  id: string;
  date: string;
  description: string | null;
  category: { name: string; type: 'INCOME' | 'EXPENSE' };
  amount: number;
  status: string;
  user?: { id: string; name: string; email: string };
}

interface TransactionsResponse {
  transactions: Transaction[];
}

export function useFinanceTransactions() {
  return useQuery<Transaction[], Error>({
    queryKey: ['finance', 'transactions'],
    queryFn: async () => {
      const { data } = await axiosdb.get<TransactionsResponse>('/api/finance/transactions');
      return data.transactions;
    }
  });
}
interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  budgetLimit: number;
  budgetUsed: number;
}

export function useFinanceCategories() {
  return useQuery<Category[], Error>({
    queryKey: ['finance', 'categories'],
    queryFn: async () => {
      const { data } = await axiosdb.get<{ categories: Category[] }>(`/api/finance/categories`);
      return data.categories;
    },
  });
}
export function useSingleCategory(id : string | null) {
  return useQuery<Category, Error>({
    queryKey: ['finance', 'category'],
    queryFn: async () => {
      const { data } = await axiosdb.get<{ category: Category }>(`/api/finance/categories/category?id=${id}`);
      return data.category;
    },
  });
}
export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosdb.delete(`/api/finance/categories/${id}`);
    },
    onSuccess() {
      qc.invalidateQueries({ queryKey: ['finance', 'categories'] });
      toast.success("Created Successfully")
    },
  });
}


interface ForecastEntry { month: string; revenue: number; expenses: number; }
interface ForecastResponse {
  past: ForecastEntry[];
  forecast: Array<{ month: string; projectedRevenue: number; projectedExpenses: number }>;
}

export function useFinanceForecast() {
  return useQuery<ForecastResponse, Error>(
    {
      queryKey: ['finance', 'forecast'],
      queryFn: async () => {
      const { data } = await axiosdb.get<ForecastResponse>('/api/finance/forecast');
      return data;
    },
    }
  );
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
  return useQuery<string[], Error>(
    {
      queryKey: ['finance', 'insights'],
      queryFn : async () => {
      const { data } = await axiosdb.get<{ insights: string[] }>('/api/insights')
      return data.insights
    },
    }
  )
}

export function useExportFinanceReport() {
  
  return useMutation({
    mutationFn: async (params: any) => {
      const { data } = await axiosdb.post(`/api/finance/export`, params);
      return data;
    },
    onSuccess () {
      toast.success("Exported Successfully")
    }
  });
}