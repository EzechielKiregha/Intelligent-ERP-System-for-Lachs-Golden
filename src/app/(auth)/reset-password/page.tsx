// Apply PROJECT_CONTEXT.md styling:
// - Dark-gold theme: use utility classes: light-mode accent bg-[#A17E25] hover:bg-[#8C6A1A], dark-mode accent dark:bg-[#D4AF37] hover:dark:bg-[#BFA132].
// - Backgrounds: bg-white / dark:bg-[#111827], card bg-white dark:bg-[#1E1E1E].
// - Text: text-gray-800 / dark:text-gray-200, muted text-gray-500 / dark:text-gray-400.
// - Navbar height h-16; Hero height h-[548px] offset by pt-16; Auth card md:h-[635px] with LeftAuthPanel + form.
// - Use Tailwind utility classes only (including arbitrary values for exact heights/spacings). Avoid inline styles.
// - Use ShadcnUI components or plain elements styled per utilities; icons from lucide-react with text-[#A17E25] dark:text-[#D4AF37].
// - Form logic: React Hook Form + Zod; data: TanStack Query + AxiosInstance; auth: NextAuth; loading overlay via LoadingContext.
// - Responsive: mobile-first; two-panel layout on md+ for auth; sidebar+main for dashboard.
// - Accessibility: focus rings focus:ring-2 focus:ring-offset-2 focus:ring-[#A17E25] dark:focus:ring-[#D4AF37], semantic HTML, ARIA roles.
// - Verify dimensions: ensure heights (h-16, h-[548px], md:h-[635px]) match shared designs.
// - Ensure consistent spacing, typography, and motion using Tailwind utilities (e.g., p-4, gap-6, transition ease-in-out duration-150).
// - Leave all logic intact (React Hook Form, TanStack Query, AxiosInstance, NextAuth, etc.).
'use client';
import { LeftAuthPanel } from '@/components/LeftAuthPanel';
import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordInput } from '@/lib/validations/reset';
import { useMutation } from '@tanstack/react-query';
import axiosdb from '@/lib/axios';
import { useLoading } from '@/contexts/loadingContext';
import { toast } from 'react-hot-toast';

export default function ResetPasswordPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-col md:flex-row min-h-screen">
        <LeftAuthPanel />
        <ResetPasswordPage />
      </div>
    </Suspense>
  );
}

function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setIsLoading } = useLoading();
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverMsg, setServerMsg] = useState<string | null>(null);

  // Extract token from URL
  const token = searchParams.get('token') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: '', confirmPassword: '' },
  });

  // Mutation to reset password
  const resetMutation = useMutation({
    mutationFn: async (data: ResetPasswordInput) => {
      const res = await axiosdb.post('/api/reset-password', data);
      return res.data;
    },
    onMutate: () => {
      setServerError(null);
      setServerMsg(null);
      setIsLoading(true);
    },
    onSuccess: (data: any) => {
      setIsLoading(false);
      toast.success(data.message || 'Password reset successful');
      setServerMsg(data.message || 'Password reset successful');
      // Optionally redirect to login after a delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    },
    onError: (err: any) => {
      setIsLoading(false);
      const msg = err.response?.data?.message || 'Reset failed';
      setServerError(msg);
      toast.error(msg);
    },
  });

  const onSubmit = (data: ResetPasswordInput) => {
    // Ensure token in data
    resetMutation.mutate({ ...data, token });
  };

  // If no token, show error
  useEffect(() => {
    if (!token) {
      setServerError('Missing token');
      toast.error('Missing token');
    }
  }, [token]);

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-[#F5F5F5]">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-center text-[20px] font-semibold text-[#333333]">
          Reset Password
        </h1>
        {serverError && !token ? (
          <p className="mt-4 text-center text-[12px] text-[#E53E3E]">{serverError}</p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            {/* New Password */}
            <div>
              <label htmlFor="password" className="block mb-1 text-[14px] text-[#333333]">
                New Password
              </label>
              <input
                id="password"
                type="password"
                {...register('password')}
                className="w-full px-4 py-3 border border-[#CCCCCC] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-[12px] text-[#E53E3E]">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block mb-1 text-[14px] text-[#333333]">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className="w-full px-4 py-3 border border-[#CCCCCC] rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E40AF]"
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-[12px] text-[#E53E3E]">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {serverError && (
              <p className="text-center mt-1 text-[12px] text-[#E53E3E]">{serverError}</p>
            )}
            {serverMsg && (
              <p className="text-center mt-1 text-[12px] text-[#333333]">{serverMsg}</p>
            )}

            <button
              type="submit"
              disabled={resetMutation.status === "pending" || !token}
              className="
                w-full mt-2 px-4 py-3
                rounded-md
                text-white
                bg-[#1E40AF] hover:bg-[#1C3A9B]
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-[#1E40AF]
              "
            >
              {resetMutation.status === "pending" ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}
        <div className="mt-4 text-center text-[14px]">
          <a href="/login" className="text-[#1E40AF] hover:underline">
            Back to Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
