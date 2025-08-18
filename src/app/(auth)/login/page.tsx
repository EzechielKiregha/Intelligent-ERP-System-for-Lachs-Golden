'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/lib/validations/login';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { LeftAuthPanel } from '@/components/LeftAuthPanel';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
import BasePopover from '@/components/BasePopover';
import axiosdb from '@/lib/axios';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Role } from '@/generated/prisma';
import { useAuth } from 'contents/authContext';
import { sendOtpRequest } from '@/lib/emailClients';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otpPopoverOpen, setOtpPopoverOpen] = useState(false);
  const [otp, setOtp] = useState<string>("");
  const [toEmail, setEmail] = useState<string>("");
  const user = useAuth().user;
  const logout = useAuth().logout

  const isCompanyCreated = searchParams.get('companycreated') === 'true';
  const isJoinWorkspace = searchParams.get('join-ws') === 'true';
  const wsId = searchParams.get('wsId');
  const inviteCode = searchParams.get('inviteCode');

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
      if (!res) throw new Error('No response from signIn');
      if (res.error) throw new Error(res.error);
      return res;
    },
    onSuccess: async (res, data) => {
      if (res.ok) {
        if (isCompanyCreated) {
          toast.success('Login successful!');
          router.push('/dashboard');
        } else {
          // await axiosdb.post('/api/mail/otp', { toEmail: data.email });
          try {
            const res = await sendOtpRequest(data.email);
            toast.success(res.data.message);
            setEmail(data.email || '');
            setOtpPopoverOpen(true);
            return res.data;
          } catch (err: any) {
            console.error(err?.message ?? 'Failed to send OTP');
            toast.warning("Internal Server Error")
          }
        }
      }
    },
    onError: (err: any) => toast.error(err.message || 'Login failed'),
  });

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axiosdb.get(`/api/mail/verify-otp?email=${toEmail}&otp=${otp}`);
      if (res.status === 200) {
        toast.success("OTP verified successfully!");
        setOtpPopoverOpen(false);
        if (isJoinWorkspace && wsId && inviteCode) {
          router.push(`/workspaces/${wsId}/join/${inviteCode}`);
        } else {
          if (user?.role === Role.SUPER_ADMIN) {
            router.push('/dashboard');
          } else if (user?.role === Role.ACCOUNTANT) {
            router.push('/finance');
          } else if (user?.role === Role.HR) {
            router.push('/hr');
          } else if (user?.role === Role.USER) {
            toast.warning("No permission to system. Leave a message in Contact Us section")
            logout()
          } else if (user?.role === Role.MANAGER || user?.role === Role.EMPLOYEE || user?.role === Role.MEMBER) {
            router.push('/inventory');
          } else if (user?.role === Role.CEO) {
            router.push('/dashboard');
          }
        }
      } else {
        console.error("OTP verification failed:", res.data);
        toast.error("Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      toast.error("OTP verification failed. Please try again.");
    }
  };

  const onSubmit = (data: LoginInput) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#0a0e16] px-4">
      <div className="bg-white dark:bg-[#111827] shadow-2xl rounded-lg flex flex-col md:flex-row w-full max-w-[900px] md:h-[535px] overflow-hidden">
        <LeftAuthPanel backgroundImage='https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1415&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' />
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

            <Button
              disabled={loginMutation.isPending}
              type="submit"
              className="w-full bg-gradient-to-l from-[#80410e] to-[#c56a03] hover:bg-[#8C6A1A] dark:from-[#80410e] dark:to-[#b96c13] dark:hover:bg-[#BFA132] text-white rounded-lg py-2 disabled:opacity-50"
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
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
      {/* OTP Popover */}
      <BasePopover
        title="Two-Factor Authentication"
        buttonLabel=""
        isOpen={otpPopoverOpen}
        onClose={() => setOtpPopoverOpen(false)}
      >
        <div className="text-center text-sidebar-foreground bg-sidebar">
          <p className=" text-sidebar-foreground mb-4">
            Enter the 6-digit code sent to your email.
          </p>
          <InputOTP
            type="text"
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
            className="flex justify-center gap-2 bg-sidebar  rounded-lg p-2 shadow-md"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <Button
            onClick={handleVerifyOtp}
            className="bg-gradient-to-l cursor-pointer mt-3.5 mx-auto from-[#80410e] to-[#c56a03] hover:bg-[#8C6A1A] dark:from-[#80410e] dark:to-[#b96c13] dark:hover:bg-[#BFA132] text-white rounded-lg py-2 disabled:opacity-50"
          >
            Verify OTP
          </Button>
        </div>
      </BasePopover>
    </div>
  );
}
