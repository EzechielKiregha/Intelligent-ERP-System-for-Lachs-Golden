'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/lib/validations/login';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useLoading } from '@/contexts/loadingContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { LeftAuthPanel } from '@/components/LeftAuthPanel';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

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
      toast.success('Login successful!');
      router.push('/dashboard');
    },
    onError: (err: any) => {
      setIsLoading(false);
      toast.error(err.message || 'Login failed');
    },
  });

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#111827] px-4">
      <div className="bg-white dark:bg-[#1E1E1E] shadow-lg rounded-lg flex flex-col md:flex-row w-full max-w-[900px] md:h-[635px] overflow-hidden">
        <LeftAuthPanel />
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-4">
            <h1 className="text-[24px] font-semibold text-gray-800 dark:text-gray-200">Sign In</h1>
            <div>
              <Label htmlFor="email" className="text-sm text-gray-800 dark:text-gray-200">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className="mt-1"
                placeholder="you@company.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-[#E53E3E] dark:text-[#FC8181]">{errors.email.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="password" className="text-sm text-gray-800 dark:text-gray-200">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className="mt-1"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-[#E53E3E] dark:text-[#FC8181]">{errors.password.message}</p>
              )}
            </div>
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                {...register('rememberMe')}
                className="h-4 w-4 text-[#A17E25] dark:text-[#D4AF37] border-gray-300 dark:border-[#374151] rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-800 dark:text-gray-200">
                Remember me
              </label>
            </div>
            {serverError && (
              <p className="text-center mt-1 text-xs text-[#E53E3E] dark:text-[#FC8181]">{serverError}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-[#A17E25] hover:bg-[#8C6A1A] dark:bg-[#D4AF37] dark:hover:bg-[#BFA132] text-white rounded-lg py-2 disabled:opacity-50"
            >
              {loginMutation.status === "pending" ? 'Signing in...' : 'Sign In'}
            </Button>
            <div className="mt-4 flex justify-between text-sm text-gray-800 dark:text-gray-200">
              <Link href="/forgot-password" className="text-[#A17E25] hover:underline dark:text-[#D4AF37]">
                Forgot password?
              </Link>
              <Link href="/signup" className="text-[#A17E25] hover:underline dark:text-[#D4AF37]">
                Create account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
