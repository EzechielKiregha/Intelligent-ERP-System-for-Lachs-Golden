import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export function useSaveNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notification: any) => {
      if (notification.id) {
        const { data } = await axios.put(`/api/contact-us/${notification.id}`, notification);
        return data;
      } else {
        const { data } = await axios.post('/api/contact-us', notification);
        return data;
      }
    },
    onSuccess: () => qc.invalidateQueries({
      queryKey: ['notifications'],
    }),
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await axios.get('/api/contact-us');
      return data;
    },
  });
}
