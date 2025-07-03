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

// Define the type for the new transaction data being sent to the API
// This now directly matches the TransactionForm type from your component
interface NewTransactionData {
  categoryId: string;
  amount: number;
  description?: string;
  type: 'ORDER' | 'REFUND' | 'PAYMENT'; // Adapted to match your form's transactionTypes
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'; // Adapted to match your form's status types
}

// Define the type for the response from the API after creating a transaction
interface CreatedTransactionResponse {
  id: string;
  categoryId: string;
  amount: number;
  description?: string;
  type: 'ORDER' | 'REFUND' | 'PAYMENT'; // Adapted
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'; // Adapted
}

/**
 * Custom hook for creating a new finance transaction.
 * On successful creation, it invalidates relevant queries to refetch data.
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient(); // Get the query client instance

  return useMutation<CreatedTransactionResponse, Error, NewTransactionData>({
    mutationFn: async (newTransactionData) => {
      // Send the POST request to your API endpoint
      const { data } = await axiosdb.post<CreatedTransactionResponse>('/api/finance/transactions', newTransactionData);
      return data;
    },
    onSuccess: (data) => {
      // This function runs when the mutation is successful.

      // 1. Invalidate the 'finance', 'transactions' query
      queryClient.invalidateQueries({ queryKey: ['finance', 'transactions'] });

      // 2. Invalidate the 'finance', 'categories' query
      // This is crucial because creating a transaction updates the budgetUsed on the category.
      queryClient.invalidateQueries({ queryKey: ['finance', 'categories'] });

      // 3. Invalidate the specific single category query if it's currently active.
      queryClient.invalidateQueries({ queryKey: ['finance', 'category', data.categoryId] });

      // Optional: Show a success toast notification
      toast.success('Transaction created successfully!');
    },
    onError: (error) => {
      // This function runs if the mutation fails.
      console.error('Error creating transaction:', error);
      // You can parse the error message from the backend if it sends structured errors
      const errorMessage = (error as any).response?.data?.error || 'Failed to create transaction.';
      toast.error(errorMessage);
    },
  });
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