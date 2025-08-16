// app/settings/hooks/useCompanySettings.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosdb from '@/lib/axios';
import { toast } from 'sonner';

// 🔹 Define the shape of company settings
export interface CompanySettings {
  // Inventory
  lowStockThreshold: number; // e.g., 10 units
  autoRestockEnabled: boolean;

  // HR
  payrollCycle: 'monthly' | 'biweekly' | 'weekly'; // when payroll is processed
  reviewCycle: 'quarterly' | 'semiannual' | 'annual'; // performance review schedule
  defaultLeavePolicy: {
    annual: number; // days
    sick: number;
    parental: number;
  };

  // CRM
  leadResponseTime: 'immediate' | 'within-1h' | 'within-24h'; // SLA for customer response
  autoTaggingEnabled: boolean;

  // System
  aiInsightsEnabled: boolean; // whether AI suggestions are active
  dataRetentionDays: number; // how long logs are kept
  backupSchedule: 'daily' | 'weekly' | 'monthly';

  // Notifications
  emailAlertsEnabled: boolean;
  slackIntegrationEnabled: boolean;
  criticalAlertsOnly: boolean;
}

// 🔹 API: Get company settings
export function useCompanySettings() {
  return useQuery<CompanySettings>({
    queryKey: ['company', 'settings'],
    queryFn: async () => {
      const { data } = await axiosdb.get('/api/settings/company');
      return data as CompanySettings;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// 🔹 API: Update a single setting
interface UpdateSettingPayload {
  key: keyof CompanySettings;
  value: any;
}

export function useUpdateCompanySetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: UpdateSettingPayload) => {
      const { data } = await axiosdb.patch('/api/settings/company', { [key]: value });
      return data;
    },
    onMutate: async ({ key, value }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['company', 'settings'] });
      const previousSettings = queryClient.getQueryData(['company', 'settings']);
      queryClient.setQueryData(['company', 'settings'], (old: CompanySettings | undefined) => ({
        ...old,
        [key]: value,
      }));
      return { previousSettings };
    },
    onSuccess: () => {
      toast.success('Setting updated successfully');
    },
    onError: (err, { key }, context) => {
      toast.error(`Failed to update ${String(key)}. Reverting.`);
      // Rollback
      if (context?.previousSettings) {
        queryClient.setQueryData(['company', 'settings'], context.previousSettings);
      }
    },
    onSettled: () => {
      // Refetch to ensure sync
      queryClient.invalidateQueries({ queryKey: ['company', 'settings'] });
    },
  });
}

// 🔹 API: Bulk update settings (optional)
export function useUpdateCompanySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<CompanySettings>) => {
      const { data } = await axiosdb.patch('/api/settings/company', settings);
      return data;
    },
    onSuccess: () => {
      toast.success('All settings updated');
      queryClient.invalidateQueries({ queryKey: ['company', 'settings'] });
    },
    onError: () => {
      toast.error('Failed to update settings');
    },
  });
}