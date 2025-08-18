'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axiosdb from '@/lib/axios';
import { LeftAuthPanel } from '@/components/LeftAuthPanel';
import { toast } from 'sonner';
import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { sendForgotPasswordRequest } from '@/lib/emailClients';

const forgotSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

type ForgotInput = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotInput>({
    resolver: zodResolver(forgotSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: ForgotInput) => {
      const res = await axiosdb.post(`/api/mail/forgot-password?email=${data.email}`);
      return res.data;
    },
    onSuccess: (_, variables) => {
      setSubmittedEmail(variables.email);
      setIsModalOpen(true);
      toast.success("If this email exists, a reset link has been sent.");
    },
    onError: () => {
      toast.error("Something went wrong. Please try again later.");
    },
  });

  const onSubmit = async (d: ForgotInput) => {
    // mutation.mutate(data);
    try {
      const { data } = await sendForgotPasswordRequest(d.email)
      console.log('forgot response', data);
    } catch (err) {
      console.error('forgot error', err);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-sidebar px-4">
        <div className="bg-white dark:bg-[#111827] shadow-2xl rounded-lg flex flex-col md:flex-row w-full max-w-[900px] md:h-[535px] overflow-hidden">
          <LeftAuthPanel backgroundImage='https://plus.unsplash.com/premium_photo-1700592624090-8407e5c1dd52?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' />
          <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-4">
              <h1 className="text-[24px] font-semibold text-gray-800 dark:text-gray-200">Forgot Password</h1>
              <div>
                <label htmlFor="email" className="block mb-1 text-sm text-gray-800 dark:text-gray-200">
                  Enter your work email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-[#374151] rounded-md focus:outline-none focus:ring-2 focus:ring-[#A17E25] dark:focus:ring-[#D4AF37] bg-transparent text-gray-800 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  placeholder="you@company.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-[#E53E3E] dark:text-[#FC8181]">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={mutation.status === "pending"}
                className="w-full bg-gradient-to-l from-[#80410e] to-[#c56a03] hover:bg-[#8C6A1A] dark:from-[#80410e] dark:to-[#b96c13] dark:hover:bg-[#BFA132] text-white rounded-lg py-2 disabled:opacity-50"
              >
                {mutation.status === "pending" ? 'Submitting...' : 'Send Reset Link'}
              </button>
              <div className="mt-4 text-center text-sm text-gray-800 dark:text-gray-200">
                <Link href="/login" className="text-[#A17E25] hover:underline dark:text-[#D4AF37]">
                  Back to Sign In
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-sidebar text-sidebar-foreground">
          <DialogHeader>
            <DialogTitle>Reset Link Sent</DialogTitle>
            <DialogDescription>
              If an account exists for <span className="font-semibold">{submittedEmail}</span>,
              a password reset link has been sent to that email.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                setIsModalOpen(false);
                window.location.href = '/login';
              }}
              className="bg-sider-accent text-sidebar-accent-foreground"
            >
              Back to Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
