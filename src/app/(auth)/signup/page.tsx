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
import { sendWelcomeEmail } from '@/components/mailler-send/Otp';
import { generateOtp } from '@/components/mailler-send/Otp';
import { useState } from 'react';
import BasePopover from '@/components/BasePopover';

export default function SignUpPage() {
  const router = useRouter();

  const [otpPopoverOpen, setOtpPopoverOpen] = useState(false);
  const [otp, setOtp] = useState<string>("");
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
      const otp = generateOtp(); // Generate OTP
      const res = await axiosdb.post('/api/signup', { ...data, otp }); // Store OTP alongside user data
      await sendWelcomeEmail(data.email, "http://localhost.com/login", otp); // Send WelcomeEmail
      return res.data;
    },
    onSuccess: () => {
      toast.success('Account created successfully!');
      setOtpPopoverOpen(true); // Open OTP popover
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      toast.error(msg);
    },
  });

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axiosdb.get(`/api/auth/otp?email=${toEmail}&otp=${otp}`);
      if (res.status === 200) {
        toast.success("OTP verified successfully!");
        setOtpPopoverOpen(false);
        router.push("/dashboard");
      } else {
        throw new Error("Invalid OTP");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      toast.error("OTP verification failed. Please try again.");
    }
  };

  const onSubmit = (data: SignUpInput) => {
    setEmail(data.email); // Store email for OTP verification
    signUpMutation.mutate(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#0f1522] px-4 shadow-lg">
      <div className="bg-white dark:bg-[#111827] shadow-lg rounded-lg flex flex-col md:flex-row w-full max-w-[900px] md:h-[635px] overflow-hidden">
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
              className="w-full bg-gradient-to-l from-[#80410e] to-[#c56a03] hover:bg-[#8C6A1A] dark:from-[#80410e] dark:to-[#b96c13] dark:hover:bg-[#BFA132] text-white rounded-lg py-2 disabled:opacity-50"
            >
              {signUpMutation.status === "pending" ? 'Creating ...' : 'Create Account'}
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
      {/* OTP Popover */}
      <BasePopover
        title="Two-Factor Authentication"
        buttonLabel=""
        isOpen={otpPopoverOpen}
        onClose={() => setOtpPopoverOpen(false)}
      >
        <div className="text-center">
          <p className="text-gray-800 mb-4">
            Enter the 6-digit code sent to your email.
          </p>
          <input
            title='OTP Input'
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
            maxLength={6}
          />
          <Button
            onClick={handleVerifyOtp}
            className="w-full bg-gradient-to-l from-[#80410e] to-[#c56a03] hover:bg-[#8C6A1A] dark:from-[#80410e] dark:to-[#b96c13] dark:hover:bg-[#BFA132] text-white rounded-lg py-2 disabled:opacity-50"
          >
            Verify OTP
          </Button>
        </div>
      </BasePopover>
    </div>
  );
}
