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
    <div className="flex flex-col md:flex-row min-h-screen">
      <LeftAuthPanel />
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-[#121212]">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-4">
          <h1 className="text-[24px] font-semibold text-[#333333] dark:text-white">Sign In</h1>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-[14px] text-[#333333] dark:text-white">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              className="mt-1"
              placeholder="you@company.com"
            />
            {errors.email && (
              <p className="mt-1 text-[12px] text-[#E53E3E]">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password" className="text-[14px] text-[#333333] dark:text-white">Password</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              className="mt-1"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-[12px] text-[#E53E3E]">{errors.password.message}</p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="rememberMe"
              type="checkbox"
              {...register('rememberMe')}
              className="h-4 w-4 text-[#D4AF37] border-[#CCCCCC] rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 text-[14px] text-[#333333] dark:text-white">
              Remember me
            </label>
          </div>

          {serverError && (
            <p className="text-center mt-1 text-[12px] text-[#E53E3E]">{serverError}</p>
          )}

          <Button
            type="submit"
            className="w-full mt-2 px-4 py-3 rounded-md bg-[#D4AF37] hover:bg-[#B8860B] text-white"
            disabled={loginMutation.status === 'pending'}
          >
            {loginMutation.status === "pending" ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="mt-4 flex justify-between text-[14px]">
            <Link href="/forgot-password" className="text-[#D4AF37] hover:underline">
              Forgot password?
            </Link>
            <Link href="/signup" className="text-[#D4AF37] hover:underline">
              Create account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
