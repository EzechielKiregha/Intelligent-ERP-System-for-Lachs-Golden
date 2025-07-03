import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosdb from '../axios'


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
