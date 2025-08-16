import { Role } from '@/generated/prisma';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosdb from 'axios';
import { useAuth } from 'contents/authContext';
import { useRouter } from 'next/navigation';
import {toast} from 'sonner';



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
      const { data } = await axiosdb.get<{ products : Product[]}>(API.fetch);
      return data.products;
    }
  });
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

export function useDeleteProduct(id: string) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const user = useAuth().user;

  return useMutation({
    mutationFn: async () => {
      if (user?.role === Role.ADMIN || user?.role === Role.SUPER_ADMIN || user?.role === Role.EMPLOYEE || user?.role === Role.MEMBER) {
        const res = await axiosdb.delete(`${API.delete}/${id}`)
        return res.data;
      } else {
        return {success: false, message: 'You do not have permission to delete this product.'};
      }
    },
    onSuccess: (data : any) => {
      if (!data.success) {
        toast.error(data.message);
      } else toast.success(data.message || 'Product deleted successfully');
      queryClient.invalidateQueries({
        queryKey : ['inventory','products'],
      })
      router.refresh();
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