'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, SignUpInput } from '@/lib/validations/auth';
import { useMutation } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import axiosdb from '@/lib/axios';

// Example: if ShadcnUI has a Form/Field/ErrorMessage component, use those. Otherwise, we’ll show simple text errors.
export default function SignUpPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  const [serverError, setServerError] = useState<string | null>(null);

  // TanStack useMutation for signup
  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpInput) => {
      const res = await axiosdb.post('/api/signup', data);
      return res.data;
    },
    onSuccess: () => router.push('/login'),
    onError: (err: any) => {
      // Axios error: err.response.data holds server JSON
      const msg = err.response?.data?.message || 'Signup failed';
      setServerError(msg);
    },
  });

  const onSubmit = (data: SignUpInput) => {
    setServerError(null);
    signUpMutation.mutate(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-lg">
        {/* You can adjust padding, colors, and classes per your Figma theme */}
        <h1 className="text-2xl font-semibold text-center mb-6">Create Account</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* First Name */}
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              {...register('firstName')}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              {...register('lastName')}
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
            )}
          </div>

          {/* Company */}
          <div>
            <Label htmlFor="company">Company Name</Label>
            <Input
              id="company"
              {...register('company')}
              placeholder="Your Company"
            />
            {errors.company && (
              <p className="text-sm text-red-600 mt-1">{errors.company.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Work Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="you@company.com"
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-red-700 text-center">{serverError}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={signUpMutation.status === 'pending'}
          >
            {signUpMutation.status === 'pending' ? 'Creating...' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-indigo-600 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
