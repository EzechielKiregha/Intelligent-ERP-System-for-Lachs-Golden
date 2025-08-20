// app/crm/contacts/page.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useCreateContact } from '@/lib/hooks/crm';
import ManageContactFormPopover from '../_components/ManageContactFormPopover';
import ContactTable from './_components/ContactTable';
import { useContacts } from '@/lib/hooks/crm';
import { useUserSettings } from '../../settings/hooks/useUserSettings';

export default function ContactsPage() {
  const { userData } = useUserSettings();
  const { data: contacts = [] } = useContacts();
  // const { open: openCreateContact } = useCreateContact();

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-sidebar-foreground">Contacts</h1>
        <ManageContactFormPopover>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </ManageContactFormPopover>
      </div>

      <Card className="bg-sidebar border-[var(--sidebar-border)]">
        <CardHeader>
          <CardTitle className="text-sidebar-foreground">All Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <ContactTable contacts={contacts} />
        </CardContent>
      </Card>
    </div>
  );
}