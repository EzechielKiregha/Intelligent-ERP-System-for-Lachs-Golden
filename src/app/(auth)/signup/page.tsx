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
import { useState } from 'react';

export default function SignUpPage() {
  const router = useRouter();
  const [toEmail, setEmail] = useState<string>("");

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
    onSuccess: async () => {
      toast.success("Account created successfully!"); // Show success message
      sendWelcomeEmail();
      router.replace("/login")
    },
    onError: (error: any) => {
      // Handle errors gracefully
      const errorMessage = error.response?.data?.message || "An error occurred during signup. Please try again.";
      console.error("Signup error:", errorMessage);
      toast.error("An error occurred during signup. Please try again.");
    },
  });

  const sendWelcomeEmail = async () => {
    const welcomeResponse = await axiosdb.post('/api/mail/welcome', { toEmail: toEmail });

    if (welcomeResponse.status !== 200) {
      toast.error("Failed to send welcome email. Please try again.");
    }

    toast.success("redirect... login");
  }

  const onSubmit = (data: SignUpInput) => {
    setEmail(data.email); // Store email for OTP verification
    signUpMutation.mutate(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-sidebar px-4 shadow-lg">
      <div className="bg-white dark:bg-[#111827] shadow-lg rounded-2xl flex flex-col md:flex-row w-full max-w-[900px] md:h-[535px] overflow-hidden">
        <LeftAuthPanel />
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-4">
            <h1 className="text-[24px] font-semibold text-gray-800 dark:text-gray-200">Create Account</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-sm text-gray-800 dark:text-gray-200">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
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
                  type="text"
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
                type='text'
                {...register('company')}
                className="mt-1"
                placeholder="Your Company"
              />
              {errors.company && (
                <p className="mt-1 text-xs text-[#E53E3E] dark:text-[#FC8181]">{errors.company.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email" className="text-sm text-gray-800 dark:text-gray-200">Email / Work Email</Label>
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
              disabled={signUpMutation.isPending}
              type="submit"
              className="w-full bg-gradient-to-l from-[#80410e] to-[#c56a03] hover:bg-[#8C6A1A] dark:from-[#80410e] dark:to-[#b96c13] dark:hover:bg-[#BFA132] text-white rounded-lg py-2 disabled:opacity-50"
            >
              {signUpMutation.isPending ? 'Creating ...' : 'Create Account'}
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