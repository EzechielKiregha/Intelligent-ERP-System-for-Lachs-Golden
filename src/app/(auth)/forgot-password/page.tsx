'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axiosdb from '@/lib/axios';
import { useLoading } from '@/contexts/loadingContext';
import { LeftAuthPanel } from '@/components/LeftAuthPanel';
import { toast } from 'react-hot-toast';

const forgotSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

type ForgotInput = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const { setIsLoading } = useLoading();
  const [serverMsg, setServerMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotInput>({
    resolver: zodResolver(forgotSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: ForgotInput) => {
      const res = await axiosdb.post('/api/forgot-password', data);
      return res.data;
    },
    onMutate: () => {
      setServerMsg(null);
      setIsLoading(true);
    },
    onSuccess: () => {
      setIsLoading(false);
      toast.success("If this email exists, a reset link has been sent.");
    },
    onError: () => {
      setIsLoading(false);
      toast.error("Something went wrong. Please try again later.");
    },
  });

  const onSubmit = (data: ForgotInput) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#111827] px-4">
      <div className="bg-white dark:bg-[#1E1E1E] shadow-lg rounded-lg flex flex-col md:flex-row w-full max-w-[900px] md:h-[635px] overflow-hidden">
        <LeftAuthPanel />
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-4">
            <h1 className="text-[24px] font-semibold text-gray-800 dark:text-gray-200">Forgot Password</h1>
            <div>
              <label htmlFor="email" className="block mb-1 text-sm text-gray-800 dark:text-gray-200">
                Enter your work email
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-[#374151] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A17E25] dark:focus:ring-[#D4AF37] bg-transparent text-gray-800 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                placeholder="you@company.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-[#E53E3E] dark:text-[#FC8181]">{errors.email.message}</p>
              )}
            </div>
            {serverMsg && (
              <p className="text-center mt-1 text-xs text-gray-800 dark:text-gray-200">{serverMsg}</p>
            )}
            <button
              type="submit"
              disabled={mutation.status === "pending"}
              className="w-full bg-[#A17E25] hover:bg-[#8C6A1A] dark:bg-[#D4AF37] dark:hover:bg-[#BFA132] text-white rounded-lg py-2 disabled:opacity-50"
            >
              {mutation.status === "pending" ? 'Submitting...' : 'Send Reset Link'}
            </button>
            <div className="mt-4 text-center text-sm text-gray-800 dark:text-gray-200">
              <a href="/login" className="text-[#A17E25] hover:underline dark:text-[#D4AF37]">
                Back to Sign In
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
