"use client"
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import axiosdb from '@/lib/axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LeftAuthPanel } from '@/components/LeftAuthPanel';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CardFooter } from '@heroui/react';
import { Separator } from '@/components/ui/separator';

// Define form schema with Zod
const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type UserFormData = z.infer<typeof userSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [fowardUser, setForwardUser] = useState<UserFormData | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const { data: companies, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await axiosdb.get('/api/companies');
      return res.data;
    },
  });

  const signUpMutation = useMutation({
    mutationFn: async (data: UserFormData & { companyId: string }) => {
      const res = await axiosdb.post('/api/signup', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Account created successfully! Awaiting approval.');
      router.push('/login');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create account');
    },
  });

  const onSubmit = (data: UserFormData) => {
    if (step === 1) {
      setStep(2);
      setForwardUser(data);
    } else if (step === 2 && selectedCompany) {
      signUpMutation.mutate({ ...data, companyId: selectedCompany });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-transparent px-4 shadow-lg">
      <div className="bg-white dark:bg-[#111827] shadow-lg rounded-2xl flex flex-col md:flex-row w-full max-w-[900px] md:h-[535px] overflow-hidden">
        <LeftAuthPanel />
        {/* <div className="flex items-center justify-center min-h-screen bg-sidebar px-4 shadow-lg"> */}
        <Card className="w-full max-w-lg bg-white dark:bg-[#111827] shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-[24px] font-semibold text-gray-800 dark:text-gray-200">
              Sign Up - Step {step} of 2
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm text-gray-800 dark:text-gray-200">First Name</Label>
                    <Input id="firstName" placeholder="John" {...register('firstName')} className="mt-1" />
                    {errors.firstName && <p className="mt-1 text-xs text-[#E53E3E] dark:text-[#FC8181]">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm text-gray-800 dark:text-gray-200">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" {...register('lastName')} className="mt-1" />
                    {errors.lastName && <p className="mt-1 text-xs text-[#E53E3E] dark:text-[#FC8181]">{errors.lastName.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm text-gray-800 dark:text-gray-200">Email</Label>
                    <Input id="email" type="email" placeholder="you@company.com" {...register('email')} className="mt-1" />
                    {errors.email && <p className="mt-1 text-xs text-[#E53E3E] dark:text-[#FC8181]">{errors.email.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-sm text-gray-800 dark:text-gray-200">Password</Label>
                    <Input id="password" type="password" placeholder="••••••••" {...register('password')} className="mt-1" />
                    {errors.password && <p className="mt-1 text-xs text-[#E53E3E] dark:text-[#FC8181]">{errors.password.message}</p>}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <Label className="text-sm text-gray-800 dark:text-gray-200">
                    Last Step Confirm Company
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    To confirm please click the company name to ensure you have access to the correct resources and permissions within the system.
                  </p>
                  {companies && companies?.length === 1 ? (
                    <Card
                      onClick={() => setSelectedCompany(companies[0].id)}
                      className={`cursor-pointer ${selectedCompany === companies[0].id
                        ? 'bg-gradient-to-l from-[#80410e] to-[#c56a03] text-white'
                        : 'bg-white dark:bg-[#1F2A44]'
                        }`}
                    >
                      <CardContent>
                        <h3 className="font-medium">{companies[0].name}</h3>
                        <p className="text-sm">{companies[0].industry}</p>
                      </CardContent>
                    </Card>
                  ) : companies?.length === 0 ? (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        No companies found. You need to create a company to proceed with registration.
                      </p>
                      <Link
                        href={`/company/create?data=${encodeURIComponent(
                          JSON.stringify(fowardUser)
                        )}&isOwner=true`}
                        className="text-sm text-[#A17E25] hover:underline dark:text-[#D4AF37]"
                      >
                        Create a new company
                      </Link>
                    </div>
                  ) : (
                    <p>Loading companies...</p>
                  )}
                  {selectedCompany === null && companies?.length > 0 && (
                    <p className="text-xs text-[#E53E3E] dark:text-[#FC8181]">
                      Please select a company
                    </p>
                  )}
                </div>
              )}
              <div className="flex items-center">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-4 w-4 text-[#A17E25] dark:text-[#D4AF37] border-gray-300 dark:border-[#374151] rounded"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-800 dark:text-gray-200">
                  I agree to the{' '}
                  <Link href="/terms-of-service" target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#A17E25] hover:underline dark:text-[#D4AF37]">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy-policy" target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#A17E25] hover:underline dark:text-[#D4AF37]">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              <div className="flex justify-between mt-6">
                {step > 1 && (
                  <Button type="button" onClick={() => setStep(step - 1)} variant="outline" className="text-gray-800 dark:text-gray-200">
                    Previous
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={step === 2 && !selectedCompany}
                  className="bg-gradient-to-l from-[#80410e] to-[#c56a03] hover:bg-[#8C6A1A] dark:from-[#80410e] dark:to-[#b96c13] dark:hover:bg-[#BFA132] text-white"
                >
                  {step === 2 ? 'Create Account' : 'Next'}
                </Button>
              </div>
              <p className="text-center text-sm text-gray-800 dark:text-gray-200">
                Already have an account?{' '}
                <Link href="/login" className="text-[#A17E25] hover:underline dark:text-[#D4AF37]">
                  Sign in
                </Link>
              </p>

            </form>
          </CardContent>
        </Card>
      </div>
    </div >
  );
}