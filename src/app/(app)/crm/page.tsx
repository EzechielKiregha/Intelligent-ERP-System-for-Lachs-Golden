// app/crm/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useCommunicationLogs, useCreateContact } from '@/lib/hooks/crm';
import ManageContactFormPopover from './_components/ManageContactFormPopover';
import ContactTable from './contacts/_components/ContactTable';
import { useContacts } from '@/lib/hooks/crm';
import { useGetWorkspaces } from '@/features/workspaces/api/use-get-workspaces';
import { useAuth } from 'contents/authContext';
import { useUserSettings } from '../settings/hooks/useUserSettings';
import SalesPipeline from './_components/SalesPipeline';
import DealTable from './deals/_components/DealTable';
import { useDeals } from '@/lib/hooks/crm';
import DealFormPopover from './deals/_components/DealFormPopover';
import CommunicationLogFormPopover from './_components/CommunicationLogFormPopover';
import ActivityLogTable from './_components/ActivityLogTable';

export default function CRMPage() {
  const { userData } = useUserSettings();
  const { data: contacts = [] } = useContacts();
  const { data: deals = [] } = useDeals();
  const { data: logs = [], isLoading: isLogsLoading } = useCommunicationLogs();
  const { user } = useAuth();

  // Check if user has access to CRM workspace
  const { data: workspaces = [] } = useGetWorkspaces();
  const crmWorkspace = workspaces.find((ws: any) => ws.name === 'Customer Relations Space');

  if (!crmWorkspace) {
    return (
      <div className="flex flex-col min-h-full">
        <h1 className="text-3xl font-semibold text-sidebar-foreground">CRM</h1>
        <Card className="mt-4 bg-sidebar border-[var(--sidebar-border)]">
          <CardContent className="p-6 text-center text-sidebar-foreground/70">
            CRM workspace not found. Please contact your administrator.
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is a member of CRM workspace
  const isCrmMember = crmWorkspace.members.some((m: any) => m.userId === user?.id);
  if (!isCrmMember && user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex flex-col min-h-full">
        <h1 className="text-3xl font-semibold text-sidebar-foreground">CRM</h1>
        <Card className="mt-4 bg-sidebar border-[var(--sidebar-border)]">
          <CardContent className="p-6 text-center text-sidebar-foreground/70">
            You don't have access to the CRM workspace.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold text-sidebar-foreground">CRM</h1>
        <ManageContactFormPopover>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </ManageContactFormPopover>
      </div>

      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList className="bg-sidebar-accent text-gray-200 p-1">
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts">
          <Card className="bg-sidebar border-[var(--sidebar-border)]">
            <CardHeader>
              <CardTitle className="text-sidebar-foreground">Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <ContactTable contacts={contacts} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals">
          <Card className="bg-sidebar border-[var(--sidebar-border)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-semibold text-sidebar-foreground">
                Deals
              </CardTitle>
              <DealFormPopover>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Deal
                </Button>
              </DealFormPopover>
            </CardHeader>
            <CardContent>
              <DealTable deals={deals} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline">
          <SalesPipeline />
        </TabsContent>

        <TabsContent value="activity">
          <Card className="bg-sidebar border-[var(--sidebar-border)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-semibold text-sidebar-foreground">
                Activity Log
              </CardTitle>
              <CommunicationLogFormPopover contactId={undefined}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Log Activity
                </Button>
              </CommunicationLogFormPopover>
            </CardHeader>
            <CardContent>
              <ActivityLogTable logs={logs} isLoading={isLogsLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}