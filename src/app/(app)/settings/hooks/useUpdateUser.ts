import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import axiosdb from '@/lib/axios';
import { z } from 'zod';
import { UpdateUserPayload, UserData } from './types';

// Schema for updating the user profile
const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

export type UserFormData = z.infer<typeof userSchema>;

/**
 * useUpdateUser
 * - Provides a mutation for updating a user profile
 * - Provides a pre-filled react-hook-form instance
 */
export function useUpdateUser(userData?: UserData | null) {
  const userForm = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: userData?.firstName || '',
      lastName: userData?.lastName || '',
      email: userData?.email || '',
      password: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: UpdateUserPayload) => {
      const res = await axiosdb.patch('/api/settings/user', payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Profile updated successfully');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    },
  });

  const onSubmit = (data: UserFormData) => {
    mutation.mutate(data);
  };

  return {
    userForm,
    updateUser: onSubmit,
    isUpdating: mutation.isPending,
    mutation,
  } as const;
}
