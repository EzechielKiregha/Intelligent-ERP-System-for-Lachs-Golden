// app/crm/contacts/manage/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useSingleContact } from '@/lib/hooks/crm';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserSettings } from '@/app/(app)/settings/hooks/useUserSettings';
import ContactDetails from './_components/ContactDetails';
import ContactDeals from './_components/ContactDeals';
import ContactActivity from './_components/ContactActivity';
import DealFormPopover from '../../deals/_components/DealFormPopover';

export default function ManageContactPage() {
  const params = useSearchParams();
  const id = params.get('id')
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('details');
  const { data: contact, isLoading } = useSingleContact(id as string);

  useEffect(() => {
    if (!id) {
      router.push('/crm/contacts');
    }
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-full">
        <h1 className="text-2xl font-semibold text-sidebar-foreground">Loading...</h1>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex flex-col min-h-full">
        <h1 className="text-2xl font-semibold text-sidebar-foreground">Contact Not Found</h1>
        <Card className="mt-4 bg-sidebar border-[var(--sidebar-border)]">
          <CardContent className="p-6 text-center text-sidebar-foreground/70">
            We couldn't find a contact with that ID.
          </CardContent>
        </Card>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push('/crm/contacts')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Contacts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.push('/crm/contacts')} className="mr-4">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-row justify-between items-end">
          <h1 className="text-2xl font-semibold text-sidebar-foreground">
            {contact.fullName}
          </h1>

        </div>

      </div>



      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-sidebar-accent text-gray-200 p-1">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <ContactDetails contact={contact} />
        </TabsContent>

        <TabsContent value="deals">
          <ContactDeals contactId={contact.id} />
        </TabsContent>

        <TabsContent value="activity">
          <ContactActivity contactId={contact.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}