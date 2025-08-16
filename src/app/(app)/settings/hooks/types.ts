import { Role, UserStatus } from '@/generated/prisma';

/**
 * Shared Settings Types
 * Centralizes shapes used by settings tabs/components and hooks.
 * Keep this file UI-agnostic.
 */

export interface CompanyImage {
  url: string;
}

export interface Company {
  id: string;
  name: string;
  contactEmail: string | null;
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  contactPhone: string | null;
  industry: string | null;
  foundedDate: string | null; // ISO date
  website: string | null;
  images: CompanyImage[] | null;
}

export interface Department {
  id?: string;
  name: string;
}

export interface Employee {
  id: string;
  jobTitle: string | null;
  department: Department | null;
  hireDate: string | null; // ISO date
}

export interface UserImage {
  url: string;
}

export interface UserData {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: Role;
  employee?: Employee | null;
  company: Company | null;
  images: UserImage[] | null;
}

export interface PendingUser {
  id: string;
  email: string;
  name: string | null;
  status: UserStatus;
}

export type TabKey = 'profile' | 'employee' | 'company' | 'admin' | 'owner';

/** Query keys (tanstack-query) */
export const QUERY_KEYS = {
  userSettings: ['userSettings'] as const,
  pendingUsers: ['pendingUsers'] as const,
};

/**
 * Minimal payloads for mutations (shape only; actual API lives elsewhere)
 */
export interface UpdateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // optional new password
}

export interface UpdateCompanyPayload {
  id: string;
  name?: string;
  contactEmail?: string | null;
  addressLine1?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
}

export interface DeleteCompanyPayload {
  id: string;
}

export interface ChangeUserRolePayload {
  userId: string;
  role: Role;
}

export interface UpdateSecuritySettingsPayload {
  enforce2FA?: boolean;
  minPasswordLength?: number;
  sessionTimeoutMinutes?: number;
}

/**
 * Role → allowed tabs helper
 */
export function tabsForRole(role: Role, hasEmployee: boolean): TabKey[] {
  const base: TabKey[] = ['profile'];

  if (hasEmployee) base.push('employee');

  switch (role) {
    case Role.ADMIN:
      return [...base, 'company', 'admin'];
    case Role.SUPER_ADMIN:
      return [...base, 'company', 'admin', 'owner'];
    // Managers often have elevated employee context; adjust as needed
    case Role.MANAGER:
    case Role.CEO:
    case Role.ACCOUNTANT:
    case Role.HR:
    case Role.EMPLOYEE:
    case Role.USER:
    case Role.MEMBER:
    default:
      return base;
  }
}

/**
 * Fine-grained guard used by the Tabs onChange to block navigation.
 */
export function canAccessTab(tab: TabKey, role: Role, user: UserData | null): boolean {
  if (!user) return false;
  if (tab === 'profile') return true;
  if (tab === 'employee') return !!user.employee;
  if (tab === 'company') return role === Role.ADMIN || role === Role.SUPER_ADMIN;
  if (tab === 'admin') return role === Role.ADMIN || role === Role.SUPER_ADMIN;
  if (tab === 'owner') return role === Role.SUPER_ADMIN;
  return false;
}

/**
 * Small format helpers
 */
export function fullName(user: Pick<UserData, 'firstName' | 'lastName'>): string {
  return [user.firstName, user.lastName].filter(Boolean).join(' ');
}
