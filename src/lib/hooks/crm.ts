import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosdb from '../axios'
import { DealStage } from '@/generated/prisma'
import { toast } from 'sonner'
import { Deal } from '@/app/(app)/crm/deals/types/types'


export const useContacts = () => {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data } = await axiosdb.get('/api/crm/contacts')
      return data
    },
  })
}

export const useCreateContact = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (newContact: any) => {
      const { data } = await axiosdb.post('/api/crm/contacts', newContact)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  })
}

export const useUpdateContact = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...rest }: any) => {
      const { data } = await axiosdb.put(`/api/crm/contacts/${id}`, rest)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  })
}

export const useDeleteContact = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosdb.delete(`/api/crm/contacts/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  })
}

export interface Contact {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  companyName?: string;
  jobTitle?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  companyId: string;
}

export function useDealsByContactId(contactId?: string) {
  return useQuery({
    queryKey: ['deals', 'contact', contactId],
    queryFn: async () => {
      const { data } = await axiosdb.get(`/api/crm/deals?contactId=${contactId}`);
      return data as Array<{
        id: string;
        title: string;
        amount: number;
        stage: DealStage;
        createdAt: string;
        updatedAt: string;
        contact: {
          id: string;
          fullName: string;
          email: string;
        }
      }>;
    },
    enabled: !!contactId,
  });
}

export function useSingleDeal(id?: string) {
  return useQuery({
    queryKey: ['deals', 'deal', id],
    queryFn: async () => {
      const { data } = await axiosdb.get(`/api/crm/deals/${id}`);
      return data as Deal;
    },
    enabled: !!id,
  });
}

export function useSingleContact(id?: string) {
  return useQuery<Contact, Error>({
    queryKey: ['contacts', 'contact', id],
    queryFn: async () => {
      const { data } = await axiosdb.get(`/api/crm/contacts/${id}`);
      return data as Contact;
    },
    enabled: !!id,
  });
}

export interface CommunicationLog {
  id: string;
  type: string;
  direction: string;
  message?: string;
  timestamp: string;
  dealId?: string;
  contactId?: string;
  contact?: Contact;
  deal?: Deal;
}

export function useCommunicationLogsByContactId(contactId?: string) {
  return useQuery<CommunicationLog[], Error>({
    queryKey: ['communication-logs', 'contact', contactId],
    queryFn: async () => {
      const { data } = await axiosdb.get(`/api/communication-logs?contactId=${contactId}`);
      return data as CommunicationLog[];
    },
    enabled: !!contactId,
  });
}

export function useCreateCommunicationLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (log: Omit<CommunicationLog, 'id'>) => {
      const { data } = await axiosdb.post('/api/communication-logs', log);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['communication-logs'] });
      toast.success('Communication logged successfully');
    },
    onError: () => {
      toast.error('Failed to log communication');
    },
  });
}

export function useCommunicationLogs() {
  return useQuery<CommunicationLog[], Error>({
    queryKey: ['communication-logs', 'all'],
    queryFn: async () => {
      const { data } = await axiosdb.get('/api/communication-logs');
      return data as CommunicationLog[];
    },
  });
}

export function useDeals() {
  return useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const { data } = await axiosdb.get('/api/crm/deals');
      return data as Deal[]
    },
  });
}

export function useCreateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (deal: any) => {
      const { data } = await axiosdb.post('/api/crm/deals', deal);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deals'] });
    },
  });
}

export function useUpdateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (deal: any) => {
      const { data } = await axiosdb.patch(`/api/crm/deals/${deal.id}`, deal);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deals'] });
    },
  });
}

export function useDeleteDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axiosdb.delete(`/api/crm/deals/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['deals'] });
    },
  });
}