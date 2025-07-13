"use client"
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CompanyFormData, companySchema } from '@/lib/validations/company';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDownIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { useCreateCompany } from '@/lib/hooks/use-owner-company';
import { Role } from '@/generated/prisma';
import axiosdb from '@/lib/axios';
import z from 'zod';

interface CreateCompanyProps {
  onCancel?: () => void;
  isOwner?: boolean;
  fowardUser?: any;
}

// Define form schema with Zod
const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type UserFormData = z.infer<typeof userSchema>;

export default function CreateCompanyForm({
  onCancel,
  isOwner = false,
  fowardUser = null,
}: CreateCompanyProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [date, setDate] = useState<Date | undefined>(new Date())
  const createCompanyMutation = useCreateCompany();

  const { register, handleSubmit, control, watch, trigger, formState: { errors } } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: '',
      description: '',
      industry: '',
      contactEmail: '',
      contactPhone: '',
      website: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      foundedDate: undefined,
      employeeCount: undefined,
      taxId: '',
      timezone: '',
      dateFormat: '',
      forecastedRevenue: undefined,
      forecastedExpenses: undefined,
    },
  });


  const formData = watch();

  const stepFields: { [key: number]: (keyof CompanyFormData)[] } = {
    1: ['name', 'description', 'industry'],
    2: ['contactEmail', 'contactPhone', 'website'],
    3: ['addressLine1', 'addressLine2', 'city', 'state', 'postalCode', 'country'],
    4: ['foundedDate', 'employeeCount', 'taxId', 'timezone', 'dateFormat', 'forecastedRevenue', 'forecastedExpenses'],
  };

  const handleNext = async () => {
    const fieldsToValidate = stepFields[step];
    if (fieldsToValidate) {
      const isValid = await trigger(fieldsToValidate);
      if (isValid) {
        setStep(step + 1);
      }
    } else {
      setStep(step + 1);
    }
  };

  // console.log("Foward User:", fowardUser);

  const onSubmit = (data: CompanyFormData) => {
    if (isOwner && fowardUser) {
      const userData = {
        ...fowardUser,
        role: Role.OWNER,
      };
      if (step === 4) {
        createCompanyMutation.mutate({
          ...data,
          ...userData,
          foundedDate: date || undefined, // Ensure date is set correctly
        }, {
          onSuccess: () => {
            toast.success('Company created and owner created! Please log in to continue.');
            setStep(5); // Move to review step
          },
          onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to create company');
          },
        });
      } else {
        handleNext();
      }
    } else {
      if (step === 4) {
        createCompanyMutation.mutate({
          ...data,
          foundedDate: date || undefined, // Ensure date is set correctly
        }, {
          onSuccess: (data) => {
            toast.success('Company created! Please log in to continue.');
            setStep(5); // Move to review step
          },
          onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to create company');
          },
        });
      } else {
        handleNext();
      }
    }

  };

  const prevStep = () => setStep(step - 1);
  const nextStep = () => setStep(step + 1);

  return (
    <Card className="w-full max-w-lg bg-white dark:bg-[#111827] shadow-lg">
      <CardHeader>
        <CardTitle>Create Your Company - Step {step} of 5</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {step === 1 && (
            <div className="space-y-4 lg:my-16">
              <div>
                <Label className='mb-1' htmlFor="name">Company Name</Label>
                <Input id="name" placeholder="Acme Inc." {...register('name')} />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>
              <div >
                <Label className='mb-1' htmlFor="description">Description</Label>
                <Textarea id="description" {...register('description')} />
                {errors.description && <p className="text-red-600 text-sm">{errors.description.message}</p>}
              </div>
              <div>
                <Label className='mb-1' htmlFor="industry">Industry</Label>
                <Select onValueChange={(value) => control._formValues.industry = value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent className=" bg-sidebar" >
                    {['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Education', 'Other'].map((ind) => (
                      <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 lg:my-16">
              <div>
                <Label className='mb-1' htmlFor="contactEmail">Contact Email</Label>
                <Input id="contactEmail" type="email" placeholder="info@company.com" {...register('contactEmail')} />
                {errors.contactEmail && <p className="text-sm text-red-500">{errors.contactEmail.message}</p>}
              </div>
              <div>
                <Label className='mb-1' htmlFor="contactPhone">Contact Phone</Label>
                <Input id="contactPhone" placeholder="+1 234 567 8900" {...register('contactPhone')} />
              </div>
              <div>
                <Label className='mb-1' htmlFor="website">Website</Label>
                <Input id="website" placeholder="https://company.com" {...register('website')} />
                {errors.website && <p className="text-sm text-red-500">{errors.website.message}</p>}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 ">
              <div>
                <Label className='mb-1' htmlFor="addressLine1">Address Line 1</Label>
                <Input id="addressLine1" placeholder="123 Main St" {...register('addressLine1')} />
              </div>
              <div>
                <Label className='mb-1' htmlFor="addressLine2">Address Line 2</Label>
                <Input id="addressLine2" placeholder="Suite 100" {...register('addressLine2')} />
              </div>
              <div>
                <Label className='mb-1' htmlFor="city">City</Label>
                <Input id="city" placeholder="New York" {...register('city')} />
              </div>
              <div>
                <Label className='mb-1' htmlFor="state">State/Province</Label>
                <Input id="state" placeholder="NY" {...register('state')} />
              </div>
              <div>
                <Label className='mb-1' htmlFor="postalCode">Postal Code</Label>
                <Input id="postalCode" placeholder="10001" {...register('postalCode')} />
              </div>
              <div>
                <Label className='mb-1' htmlFor="country">Country</Label>
                <Select onValueChange={(value) => control._formValues.country = value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className='bg-sidebar'>
                    {['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany'].map((ctr) => (
                      <SelectItem className='hover:bg-sidebar-accent' key={ctr} value={ctr}>{ctr}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-2">
              <div>
                <Label className='mb-1 ' htmlFor="foundedDate">Founded Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between" >
                      {date ? date.toLocaleDateString() : 'Select date'}<ChevronDownIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-auto bg-sidebar">
                    <Calendar mode="single" selected={date} onSelect={(d) => setDate(d || undefined)} />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className='mb-1' htmlFor="employeeCount">Employee Count</Label>
                <Input type="number" id="employeeCount" {...register('employeeCount', { valueAsNumber: true })} />
                {errors.employeeCount && <p className="text-sm text-red-500">{errors.employeeCount.message}</p>}
              </div>
              <div>
                <Label className='mb-1' htmlFor="taxId">Tax ID</Label>
                <Input id="taxId" placeholder="12-3456789" {...register('taxId')} />
              </div>
              <div>
                <Label className='mb-1' htmlFor="timezone">Timezone</Label>
                <Select onValueChange={(value) => control._formValues.timezone = value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'].map((tz) => (
                      <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.timezone && <p className="text-sm text-red-500">{errors.timezone.message}</p>}
              </div>
              <div>
                <Label className='mb-1' htmlFor="dateFormat">Date Format</Label>
                <Select onValueChange={(value) => control._formValues.dateFormat = value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    {['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].map((df) => (
                      <SelectItem key={df} value={df}>{df}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.dateFormat && <p className="text-sm text-red-500">{errors.dateFormat.message}</p>}
              </div>
              <div>
                <Label className='mb-1' htmlFor="forecastedRevenue">Forecasted Revenue</Label>
                <Input type="number" step="0.01" id="forecastedRevenue" {...register('forecastedRevenue', { valueAsNumber: true })} />
                {errors.forecastedRevenue && <p className="text-sm text-red-500">{errors.forecastedRevenue.message}</p>}
              </div>
              <div>
                <Label className='mb-1' htmlFor="forecastedExpenses">Forecasted Expenses</Label>
                <Input type="number" step="0.01" id="forecastedExpenses" {...register('forecastedExpenses', { valueAsNumber: true })} />
                {errors.forecastedExpenses && <p className="text-sm text-red-500">{errors.forecastedExpenses.message}</p>}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <ScrollArea className="h-94 w-full border rounded-md p-2">
                <div className="space-y-2">
                  <p className='border-b'><strong>Name:</strong> {formData.name}</p>
                  <p className='border-b'><strong>Description:</strong> {formData.description || 'N/A'}</p>
                  <p className='border-b'><strong>Industry:</strong> {formData.industry || 'N/A'}</p>
                  <p className='border-b'><strong>Email:</strong> {formData.contactEmail || 'N/A'}</p>
                  <p className='border-b'><strong>Phone:</strong> {formData.contactPhone || 'N/A'}</p>
                  <p className='border-b'><strong>Website:</strong> {formData.website || 'N/A'}</p>
                  <p className='border-b'><strong>Address:</strong> {formData.addressLine1 || ''} {formData.addressLine2 || ''} {formData.city || ''} {formData.state || ''} {formData.postalCode || ''} {formData.country || ''}</p>
                  <p className='border-b'><strong>Founded Date:</strong> {date?.toLocaleString() || 'N/A'}</p>
                  <p className='border-b'><strong>Employee Count:</strong> {formData.employeeCount || 'N/A'}</p>
                  <p className='border-b'><strong>Tax ID:</strong> {formData.taxId || 'N/A'}</p>
                  <p className='border-b'><strong>Timezone:</strong> {formData.timezone}</p>
                  <p className='border-b'><strong>Date Format:</strong> {formData.dateFormat}</p>
                  <p className='border-b'><strong>Forecasted Revenue:</strong> {formData.forecastedRevenue || 'N/A'}</p>
                  <p className='border-b'><strong>Forecasted Expenses:</strong> {formData.forecastedExpenses || 'N/A'}</p>
                </div>
              </ScrollArea>
              <p>Please log back in to activate your new company.</p>
              <Button type="button" onClick={() => {
                if (isOwner) {
                  router.push('/login')
                } else {
                  router.push('/login?companycreated=true')
                }
              }} className="w-full">
                Log In
              </Button>
            </div>
          )}

          {step < 5 && (
            <div className="flex justify-between mt-6">
              {onCancel && (
                <Button
                  variant={"outline"}
                  disabled={createCompanyMutation.isPending}
                  type="button"
                  className="font-bold"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}
              {step > 1 && <Button type="button" onClick={prevStep} variant="outline">Previous</Button>}
              {step < 4 && <Button type="button" onClick={nextStep}>Next</Button>}
              {step === 4 && (
                <Button type="submit" disabled={createCompanyMutation.isPending} >
                  {(createCompanyMutation.isPending ? 'Creating...' : 'Create Company')}
                </Button>
              )}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}