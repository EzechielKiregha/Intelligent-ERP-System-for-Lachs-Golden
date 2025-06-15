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
    <div className="flex flex-col md:flex-row min-h-screen">
      <LeftAuthPanel />
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-[#121212]">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-4">
          <h1 className="text-[24px] font-semibold text-[#333333] dark:text-white">Create Account</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-[14px] text-[#333333] dark:text-white">First Name</Label>
              <Input id="firstName" {...register('firstName')} className="mt-1" placeholder="John" />
              {errors.firstName && <p className="mt-1 text-[12px] text-[#E53E3E]">{errors.firstName.message}</p>}
            </div>
            <div>
              <Label htmlFor="lastName" className="text-[14px] text-[#333333] dark:text-white">Last Name</Label>
              <Input id="lastName" {...register('lastName')} className="mt-1" placeholder="Doe" />
              {errors.lastName && <p className="mt-1 text-[12px] text-[#E53E3E]">{errors.lastName.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="company" className="text-[14px] text-[#333333] dark:text-white">Company Name</Label>
            <Input id="company" {...register('company')} className="mt-1" placeholder="Your Company" />
            {errors.company && <p className="mt-1 text-[12px] text-[#E53E3E]">{errors.company.message}</p>}
          </div>
          <div>
            <Label htmlFor="email" className="text-[14px] text-[#333333] dark:text-white">Work Email</Label>
            <Input id="email" type="email" {...register('email')} className="mt-1" placeholder="you@company.com" />
            {errors.email && <p className="mt-1 text-[12px] text-[#E53E3E]">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password" className="text-[14px] text-[#333333] dark:text-white">Password</Label>
            <Input id="password" type="password" {...register('password')} className="mt-1" placeholder="••••••••" />
            {errors.password && <p className="mt-1 text-[12px] text-[#E53E3E]">{errors.password.message}</p>}
          </div>
          <div className="flex items-center">
            <input id="terms" type="checkbox" className="h-4 w-4 text-[#D4AF37] border-[#CCCCCC] rounded" />
            <label htmlFor="terms" className="ml-2 text-[14px] text-[#333333] dark:text-white">
              I agree to the <a href="/terms" className="text-[#D4AF37] hover:underline">Terms of Service</a> and <a href="/privacy" className="text-[#D4AF37] hover:underline">Privacy Policy</a>
            </label>
          </div>
          <Button type="submit" className="w-full bg-[#D4AF37] hover:bg-[#B8860B] text-white mt-4">
            Create Account
          </Button>
          <p className="text-center text-[14px] text-[#333333] dark:text-white">
            Already have an account? <Link href="/login" className="text-[#D4AF37] hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
