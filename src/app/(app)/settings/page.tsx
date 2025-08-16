'use client';

import { useUserSettings } from './hooks/useUserSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfileSettings from './_components/ProfileSettings';
import EmployeeSettings from './_components/EmployeeSettings';
import CompanySettings from './_components/CompanySettings';
import AdminSettings from './_components/AdminSettings';
import OwnerSettings from './_components/OwnerSettings';
import { RestrictedAccessModal } from '../hr/_components/RestrictedAccessModal';
import { TabKey } from './hooks/types';

// Validate string is a valid TabKey
function isValidTabKey(tab: string): tab is TabKey {
  return ['profile', 'employee', 'company', 'admin', 'owner'].includes(tab);
}

export default function SettingsPage() {
  const {
    userData,
    tabs,
    isLoadingUser,
    restrictedTab,
    closeRestrictedTab,
    handleTabChange, // <-- This is from useUserSettings, but we'll adjust its usage
  } = useUserSettings();

  if (isLoadingUser || !userData) {
    return (
      <div className="flex flex-col min-h-full">
        <h1 className="text-3xl font-semibold text-sidebar-foreground">Settings</h1>
        <div className="mt-4 flex justify-center">
          <p className="text-sidebar-foreground/70">Loading settings...</p>
        </div>
      </div>
    );
  }

  // ✅ New onValueChange handler with correct type
  const onTabChange = (value: string) => {
    if (!isValidTabKey(value)) return;

    // Now safe to pass to your hook
    handleTabChange(value);
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* <h1 className="text-3xl font-semibold text-sidebar-foreground">Settings</h1> */}
      <div className="mt-4">
        <Tabs defaultValue="profile" onValueChange={onTabChange}>
          <div className="overflow-x-auto">
            <TabsList className="flex bg-sidebar-accent text-gray-200 w-full flex-row p-4">
              {tabs.includes('profile') && (
                <TabsTrigger value="profile">Profile</TabsTrigger>
              )}
              {tabs.includes('employee') && (
                <TabsTrigger value="employee">Employee Settings</TabsTrigger>
              )}
              {tabs.includes('company') && (
                <TabsTrigger value="company">Company Settings</TabsTrigger>
              )}
              {tabs.includes('admin') && (
                <TabsTrigger value="admin">Admin Settings</TabsTrigger>
              )}
              {tabs.includes('owner') && (
                <TabsTrigger value="owner">Owner Settings</TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="profile">
            <ProfileSettings />
          </TabsContent>

          <TabsContent value="employee">
            <EmployeeSettings />
          </TabsContent>

          <TabsContent value="company">
            <CompanySettings />
          </TabsContent>

          <TabsContent value="admin">
            <AdminSettings />
          </TabsContent>

          <TabsContent value="owner">
            <OwnerSettings />
          </TabsContent>
        </Tabs>

        {restrictedTab && (
          <RestrictedAccessModal
            isOpen={!!restrictedTab}
            onClose={closeRestrictedTab}
          />
        )}
      </div>
    </div>
  );
}