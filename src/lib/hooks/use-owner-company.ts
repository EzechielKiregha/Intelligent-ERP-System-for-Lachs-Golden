"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosdb from "../axios";
import { toast } from "sonner";
import { CompanyFormData } from "../validations/company";
import { useRouter } from "next/navigation";
import { useAuth } from "contents/authContext";

export interface C {
  id: string,
  name: string,
  description: string,
  contactEmail: string,
  contactPhone: string,   // New: Company phone number
  website: string,   // New: Company website URL
  timezone: string,
  dateFormat: string,
  industry: string,   // New: e.g., "Technology", "Finance"
  foundedDate: Date, // New: Date company was founded
  employeeCount: number,      // New: Approximate number of employees
  taxId: string,   // New: Tax identification number
  addressLine1: string,   // New: Street address
  addressLine2: string,   // New: Additional address info
  city: string,   // New: City
  state: string,   // New: State/Province
  postalCode: string,   // New: ZIP/Postal code
  country: string,   // New: Country
  forecastedRevenue: number,
  forecastedExpenses: number,
  images: {
    url: string
  }[]
}

export function useGetCompanyById(companyId: string) {
  return useQuery({
    queryKey: ['ownerCompany', companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const res = await axiosdb.get(`/api/owner-companies/${companyId}`);
      // console.log("[Returned Data] ", res.data.comps)
      return res.data.company;
    },
  });
}

// Hook to fetch owner companies
export function useGetOwnerCompanies() {
  return useQuery({
    queryKey: ['ownerCompanies'],
    queryFn: async () => {
      const res = await axiosdb.get('/api/owner-companies');
      // console.log("[Returned Data] ", res.data.comps)
      return res.data.comps;
    },
  });
}

// Hook to switch company
export function useSwitchCompany() {
  const router = useRouter();
  const { refreshSession } = useAuth(); 
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (companyId: string) => {
      const res = await axiosdb.post('/api/switch-company', { companyId });
      return res.data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['ownerCompanies'] });
      queryClient.invalidateQueries({ queryKey: ['ownerCompany', data.id] });
      
      toast.success('Company switched successfully');

      // Refresh the session to update currentCompanyId
      await refreshSession();

      // Force a full-page reload
      window.location.href = '/';
    },
    onError: () => toast.error('Failed to switch company'),
  });
}

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CompanyFormData) => {

      if (data.email && data.password) {
        const res = await axiosdb.post('/api/companies', data, {
          headers: {
            'is-new-owner': 'true',
          },
        });

        return res.data;
      } else {
        const res = await axiosdb.post('/api/companies', data);
        return res.data;
      }

    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerCompanies'] });
      toast.success('Company created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create company');
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string|undefined) => axiosdb.delete(`/api/settings/company` , { data: { companyId: id } }),
    onMutate: () => {
      queryClient.cancelQueries({ queryKey: ['ownerCompanies'] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerCompanies'] });
      toast.success("Deleted Successfully")
    },
    onError () {
      toast.error("Failed")
    }
  });
}