import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosdb from 'axios';
import toast from 'react-hot-toast';

const API = {
  fetch: '/api/inventory/products',
  create: '/api/inventory/products/create',
  update: '/api/inventory/products/update',
  delete: '/api/inventory/products',
};

export interface Product {
  id: string,
  name: string,
  sku: string,
  quantity: number,
  threshold: number,
  description?: string,
  unitPrice: number;
};

export function useProducts() {
  return useQuery<Product[], Error>({
    queryKey : ['inventory','products'], 
    queryFn: async () => {
      const { data } = await axiosdb.get<Product[]>(API.fetch);
      return data;
    }
  });
}

export function useInventorySummaryCards() {
  return useQuery({
    queryKey: ['inventory', 'summary-cards'],
    queryFn: async () => {
      const { data } = await axiosdb.get('/api/inventory/summary-cards')
      return data
    },
  })
}

interface InventorySummaryData {
  totalProducts: number
  lowStockCount: number
  totalInventoryCost: number
  trend: Array<{ month: string; stock: number; cost: number }>
  recentOrders: Array<{
    id: string
    date: string
    description: string | null
    amount: number
    category: string
    status: string
  }>
}

export function useInventorySummary() {
  return useQuery({
    queryKey: ['inventory','summary'],
    queryFn: async () => {
      const { data } = await axiosdb.get<InventorySummaryData>('/api/inventory/summary')
      return data
    },
  })
}



export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (product: any) => axiosdb.post(API.create, product),
    onSuccess: () => queryClient.invalidateQueries({
      queryKey : ['inventory','products'],
    }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (product: any) => axiosdb.put(API.update, product),
    onSuccess: () => queryClient.invalidateQueries({
      queryKey : ['inventory','products'],
    }),
    onError () {
      toast.error("Failed")
    }
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => axiosdb.delete(`${API.delete}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey : ['inventory','products'],
      })
      toast.success("Deleted Successfully")
    },
    onError () {
      toast.error("Failed")
    }
  });
}

export function useLowStockProducts() {
  return useQuery(
    {
      queryKey: ['products','low-stock'],
    queryFn: async () => {
      const { data } = await axiosdb.get<Product[]>('/api/inventory/products/low-stock')
      return data
    }
    }
  )
}

export function useSingleProduct(id?: string | null) {
  return useQuery(
    {
      queryKey: ['product', id],
      queryFn: async () => {
        const { data } = await axiosdb.get<Product>(`/api/inventory/products/${id}`)
        return data
      },
    },
    
  )
}