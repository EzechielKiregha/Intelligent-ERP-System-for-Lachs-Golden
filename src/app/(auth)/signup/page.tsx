'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, SignUpInput } from '@/lib/validations/auth';
import { useMutation } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import axiosdb from '@/lib/axios';
import { LeftAuthPanel } from '@/components/LeftAuthPanel';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function SignUpPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpInput) => {
      const res = await axiosdb.post('/api/signup', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Account created successfully!');
      router.push('/login');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Signup failed';
      toast.error(msg);
    },
  });

  const onSubmit = (data: SignUpInput) => {
    signUpMutation.mutate(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#111827] px-4">
      <div className="bg-white dark:bg-[#1E1E1E] shadow-lg rounded-lg flex flex-col md:flex-row w-full max-w-[900px] md:h-[635px] overflow-hidden">
        <LeftAuthPanel />
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-4">
            <h1 className="text-[24px] font-semibold text-gray-800 dark:text-gray-200">Create Account</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-sm text-gray-800 dark:text-gray-200">First Name</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  className="mt-1"
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-[#E53E3E] dark:text-[#FC8181]">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm text-gray-800 dark:text-gray-200">Last Name</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  className="mt-1"
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-[#E53E3E] dark:text-[#FC8181]">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="company" className="text-sm text-gray-800 dark:text-gray-200">Company Name</Label>
              <Input
                id="company"
                {...register('company')}
                className="mt-1"
                placeholder="Your Company"
              />
              {errors.company && (
                <p className="mt-1 text-xs text-[#E53E3E] dark:text-[#FC8181]">{errors.company.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email" className="text-sm text-gray-800 dark:text-gray-200">Work Email</Label>
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
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-[#A17E25] dark:text-[#D4AF37] border-gray-300 dark:border-[#374151] rounded"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-800 dark:text-gray-200">
                I agree to the{' '}
                <a href="/terms" className="text-[#A17E25] hover:underline dark:text-[#D4AF37]">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-[#A17E25] hover:underline dark:text-[#D4AF37]">
                  Privacy Policy
                </a>
              </label>
            </div>
            <Button
              type="submit"
              className="w-full bg-[#A17E25] hover:bg-[#8C6A1A] dark:bg-[#D4AF37] dark:hover:bg-[#BFA132] text-white rounded-lg py-2 disabled:opacity-50"
            >
              Create Account
            </Button>
            <p className="text-center text-sm text-gray-800 dark:text-gray-200">
              Already have an account?{' '}
              <Link href="/login" className="text-[#A17E25] hover:underline dark:text-[#D4AF37]">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
