"use client"

import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PdfGeneratorToggle from '@/components/settings/PdfGeneratorToggle';

export default async function SettingPage() {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure system settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-8">
            <div className="text-xl font-semibold">General Settings</div>
            <p className="text-muted-foreground">
              General settings will be added here in the future.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid gap-8">
            <div className="text-xl font-semibold">Report Settings</div>
            <PdfGeneratorToggle />
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <div className="grid gap-8">
            <div className="text-xl font-semibold">Notification Settings</div>
            <p className="text-muted-foreground">
              Notification settings will be added here in the future.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="advanced">
          <div className="grid gap-8">
            <div className="text-xl font-semibold">Advanced Settings</div>
            <p className="text-muted-foreground">
              Advanced settings will be added here in the future.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}