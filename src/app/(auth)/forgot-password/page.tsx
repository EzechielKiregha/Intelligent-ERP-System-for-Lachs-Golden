'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axiosdb from '@/lib/axios';
import { useLoading } from '@/contexts/loadingContext';

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
      setServerMsg("If this email exists, a reset link has been sent.");
    },
    onError: () => {
      setIsLoading(false);
      setServerMsg("Something went wrong. Please try again later.");
    },
  });

  const onSubmit = (data: ForgotInput) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F5F5]">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-center text-[20px] font-semibold text-[#333333]">
          Forgot Password
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block mb-1 text-[14px] text-[#333333]">
              Enter your work email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="w-full px-4 py-3 border border-[#CCCCCC] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
              placeholder="you@company.com"
            />
            {errors.email && (
              <p className="mt-1 text-[12px] text-[#E53E3E]">
                {errors.email.message}
              </p>
            )}
          </div>

          {serverMsg && (
            <p className="text-center mt-1 text-[12px] text-[#333333]">
              {serverMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={mutation.status === "pending"}
            className="
              w-full mt-2 px-4 py-3
              rounded-md
              text-white
              bg-[#1E40AF] hover:bg-[#1C3A9B]
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-[#1E40AF]
            "
          >
            {mutation.status === "pending" ? 'Submitting...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-4 text-center text-[14px]">
          <a href="/login" className="text-[#1E40AF] hover:underline">
            Back to Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
