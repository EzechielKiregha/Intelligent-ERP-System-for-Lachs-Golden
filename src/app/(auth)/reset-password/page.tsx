'use client';
import { LeftAuthPanel } from '@/components/LeftAuthPanel';
import { Suspense } from 'react';
import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordInput } from '@/lib/validations/reset';
import { useMutation } from '@tanstack/react-query';
import axiosdb from '@/lib/axios';
import { useLoading } from '@/contexts/loadingContext';
import { toast } from 'react-hot-toast';

export default function ResetPasswordPageWrapper() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#0f1522] px-4">
      <div className="bg-white dark:bg-[#111827] shadow-lg rounded-lg flex flex-col md:flex-row w-full max-w-[900px] md:h-[635px] overflow-hidden">
        <LeftAuthPanel />
        <Suspense fallback={<div>Loading...</div>}>
          <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
            <ResetPasswordPage />
          </div>
        </Suspense>
      </div>
    </div>
  );
}

function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setIsLoading } = useLoading();

  // Extract token from URL
  const token = searchParams.get('token') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: '', confirmPassword: '' },
  });

  const resetMutation = useMutation({
    mutationFn: async (data: ResetPasswordInput) => {
      const res = await axiosdb.post('/api/reset-password', data);
      return res.data;
    },
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: (data: any) => {
      setIsLoading(false);
      toast.success(data.message || 'Password reset successful');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    },
    onError: (err: any) => {
      setIsLoading(false);
      const msg = err.response?.data?.message || 'Reset failed';
      toast.error(msg);
    },
  });

  const onSubmit = (data: ResetPasswordInput) => {
    resetMutation.mutate({ ...data, token });
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-4">
        <h1 className="text-[24px] font-semibold text-gray-800 dark:text-gray-200">Reset Password</h1>
        <div>
          <label htmlFor="password" className="block mb-1 text-sm text-gray-800 dark:text-gray-200">
            New Password
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-[#374151] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A17E25] dark:focus:ring-[#D4AF37] bg-transparent text-gray-800 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-[#E53E3E] dark:text-[#FC8181]">{errors.password.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block mb-1 text-sm text-gray-800 dark:text-gray-200">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-[#374151] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A17E25] dark:focus:ring-[#D4AF37] bg-transparent text-gray-800 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-[#E53E3E] dark:text-[#FC8181]">{errors.confirmPassword.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={resetMutation.status === "pending" || !token}
          className="w-full bg-gradient-to-l from-[#80410e] to-[#c56a03] hover:bg-[#8C6A1A] dark:from-[#80410e] dark:to-[#b96c13] dark:hover:bg-[#BFA132] text-white rounded-lg py-2 disabled:opacity-50"
        >
          {resetMutation.status === "pending" ? 'Resetting...' : 'Reset Password'}
        </button>
        <div className="mt-4 text-center text-sm text-gray-800 dark:text-gray-200">
          <a href="/login" className="text-[#A17E25] hover:underline dark:text-[#D4AF37]">
            Back to Sign In
          </a>
        </div>
      </form>
    </div>
  );
}
