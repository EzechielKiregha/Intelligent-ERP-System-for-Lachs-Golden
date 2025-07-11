import { z } from 'zod';

export const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  description: z.string().optional(),
  industry: z.string().optional(),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  foundedDate: z.union([z.string().min(1, 'Founded date is required'), z.date()]).optional(),
  employeeCount: z.number().int().positive().optional(),
  taxId: z.string().optional(),
  timezone: z.string().min(1, 'Timezone is required'),
  dateFormat: z.string().min(1, 'Date format is required'),
  forecastedRevenue: z.number().positive().optional(),
  forecastedExpenses: z.number().positive().optional(),
});

export type CompanyFormData = z.infer<typeof companySchema>;