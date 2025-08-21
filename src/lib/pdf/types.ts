
// Types for the report data
export type ReportType = 
  | 'user-activity'
  | 'financial-summary'
  | 'transaction-summary'
  | 'expense-report'
  | 'income-report'
  | 'inventory-status'
  | 'hr-compliance'
  | 'security-audit'
  | 'system-health'
  | 'sales-performance'
  | 'pipeline-analysis'
  | 'contact-engagement'
  | 'forecast-report'

export interface ReportData {
  summary?: {
    total: string;
    average: string;
    count: number;
  };
  period?: {
    start: string;
    end: string;
  };
  rows?: Array<{
    user: string;
    role: string;
    status: string;
    lastActivity: string;
  }>;
  revenue?: {
    total: string;
    recurring: string;
    new: string;
    growth: string;
  };
  expenses?: {
    total: string;
    operating: string;
    cogs: string;
  };
  revenueByCategory?: Array<{
    name: string;
    amount: string;
    percentage: string;
  }>;
  summaryByCategory?: Array<{
    name: string;
    amount: string;
    percentage: string;
  }>;
  transactions?: Array<{
    description: string;
    category: string;
    amount: string;
    date: string;
    status: string;
  }>;
}

export interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  logoUrl?: string;
}