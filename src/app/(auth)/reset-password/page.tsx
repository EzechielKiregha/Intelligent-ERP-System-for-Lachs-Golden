'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordInput } from '@/lib/validations/reset';
import { useMutation } from '@tanstack/react-query';
import AxiosInstance from '@/lib/axios';
import { useLoading } from '@/contexts/loadingContext';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setIsLoading } = useLoading();
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverMsg, setServerMsg] = useState<string | null>(null);

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

  // Mutation to reset password
  const resetMutation = useMutation({
    mutationFn: async (data: ResetPasswordInput) => {
      const res = await AxiosInstance.post('/api/reset-password', data);
      return res.data;
    },
    onMutate: () => {
      setServerError(null);
      setServerMsg(null);
      setIsLoading(true);
    },
    onSuccess: (data: any) => {
      setIsLoading(false);
      setServerMsg(data.message || 'Password reset successful');
      // Optionally redirect to login after a delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    },
    onError: (err: any) => {
      setIsLoading(false);
      const msg = err.response?.data?.message || 'Reset failed';
      setServerError(msg);
    },
  });

  const onSubmit = (data: ResetPasswordInput) => {
    // Ensure token in data
    resetMutation.mutate({ ...data, token });
  };

  // If no token, show error
  useEffect(() => {
    if (!token) {
      setServerError('Missing token');
    }
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F5F5]">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-center text-[20px] font-semibold text-[#333333]">
          Reset Password
        </h1>
        {serverError && !token ? (
          <p className="mt-4 text-center text-[12px] text-[#E53E3E]">{serverError}</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block mb-1 text-[14px] text-[#333333]">
                New Password
              </label>
              <input
                id="password"
                type="password"
                {...register('password')}
                className="w-full px-4 py-3 border border-[#CCCCCC] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-[12px] text-[#E53E3E]">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block mb-1 text-[14px] text-[#333333]">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className="w-full px-4 py-3 border border-[#CCCCCC] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-[12px] text-[#E53E3E]">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {serverError && (
              <p className="text-center mt-1 text-[12px] text-[#E53E3E]">{serverError}</p>
            )}
            {serverMsg && (
              <p className="text-center mt-1 text-[12px] text-[#333333]">{serverMsg}</p>
            )}

            <button
              type="submit"
              disabled={resetMutation.status === "pending" || !token}
              className="
                w-full mt-2 px-4 py-3
                rounded-md
                text-white
                bg-[#1E40AF] hover:bg-[#1C3A9B]
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-[#1E40AF]
              "
            >
              {resetMutation.status === "pending" ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
        <div className="mt-4 text-center text-[14px]">
          <a href="/login" className="text-[#1E40AF] hover:underline">
            Back to Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
