'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/lib/validations/login';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useLoading } from '@/contexts/loadingContext';

export default function LoginPage() {
  const router = useRouter();
  const { setIsLoading } = useLoading();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginInput) => {
      const res = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });
      if (!res) throw new Error("No response from signIn");
      if (res.error) throw new Error(res.error);
      return res;
    },
    onMutate: () => {
      setServerError(null);
      setIsLoading(true);
    },
    onSuccess: () => {
      setIsLoading(false);
      router.push('/dashboard');
    },
    onError: (err: any) => {
      setIsLoading(false);
      setServerError(err.message || 'Login failed');
    },
  });

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F5F5]">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-center text-[20px] font-semibold text-[#333333]">
          Sign In
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block mb-1 text-[14px] text-[#333333]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className="
                w-full
                px-4 py-3
                border border-[#CCCCCC]
                rounded-md
                focus:outline-none focus:ring-2 focus:ring-[#1E40AF]
              "
              placeholder="you@company.com"
            />
            {errors.email && (
              <p className="mt-1 text-[12px] text-[#E53E3E]">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block mb-1 text-[14px] text-[#333333]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="
                w-full
                px-4 py-3
                border border-[#CCCCCC]
                rounded-md
                focus:outline-none focus:ring-2 focus:ring-[#1E40AF]
              "
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-[12px] text-[#E53E3E]">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="rememberMe"
              type="checkbox"
              {...register('rememberMe')}
              className="h-4 w-4 text-[#1E40AF] border-[#CCCCCC] rounded"
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 text-[14px] text-[#333333]"
            >
              Remember me
            </label>
          </div>

          {serverError && (
            <p className="text-center mt-1 text-[12px] text-[#E53E3E]">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={loginMutation.status === "pending"}
            className="
              w-full mt-2 px-4 py-3
              rounded-md
              text-white
              bg-[#1E40AF] hover:bg-[#1C3A9B]
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-[#1E40AF]
            "
          >
            {loginMutation.status === "pending" ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 flex justify-between text-[14px]">
          <a
            href="/forgot-password"
            className="text-[#1E40AF] hover:underline"
          >
            Forgot password?
          </a>
          <a
            href="/signup"
            className="text-[#1E40AF] hover:underline"
          >
            Create account
          </a>
        </div>
      </div>
    </div>
  );
}
