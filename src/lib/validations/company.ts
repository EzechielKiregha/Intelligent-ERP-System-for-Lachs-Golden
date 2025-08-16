import { Role, UserStatus } from '@/generated/prisma';
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

  // Additional fields for company creation with user
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
  role: z.enum([
    Role.CEO,
    Role.MANAGER,
    Role.EMPLOYEE,
    Role.ADMIN,
    Role.USER,
    Role.MEMBER,
    Role.SUPER_ADMIN,
    Role.ACCOUNTANT,
    Role.HR
  ]).optional(),
  status: z.enum([UserStatus.PENDING, UserStatus.ACCEPTED, UserStatus.BLOCKED]).optional(),
  password: z.string().optional(),
  companyId: z.string().optional(),
});

export type CompanyFormData = z.infer<typeof companySchema>;