// app/crm/contacts/manage/_components/ContactDetails.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Mail, Phone, Building, Briefcase, MessageSquare } from 'lucide-react';
import { Contact } from '@/lib/hooks/crm';
import ManageContactFormPopover from '../../../_components/ManageContactFormPopover';

interface ContactDetailsProps {
  contact: Contact;
}

export default function ContactDetails({ contact }: ContactDetailsProps) {
  return (
    <Card className="bg-sidebar border-[var(--sidebar-border)]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold text-sidebar-foreground">
          Contact Details
        </CardTitle>
        <ManageContactFormPopover contact={contact}>
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </ManageContactFormPopover>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <Mail className="h-4 w-4 text-sidebar-foreground/60 mr-2" />
              <div>
                <p className="text-xs text-sidebar-foreground/60">Email</p>
                <p className="font-medium text-sidebar-foreground">{contact.email}</p>
              </div>
            </div>

            <div className="flex items-center">
              <Phone className="h-4 w-4 text-sidebar-foreground/60 mr-2" />
              <div>
                <p className="text-xs text-sidebar-foreground/60">Phone</p>
                <p className="font-medium text-sidebar-foreground">{contact.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center">
              <Building className="h-4 w-4 text-sidebar-foreground/60 mr-2" />
              <div>
                <p className="text-xs text-sidebar-foreground/60">Company</p>
                <p className="font-medium text-sidebar-foreground">{contact.companyName || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 text-sidebar-foreground/60 mr-2" />
              <div>
                <p className="text-xs text-sidebar-foreground/60">Job Title</p>
                <p className="font-medium text-sidebar-foreground">{contact.jobTitle || 'N/A'}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center mb-1">
                <MessageSquare className="h-4 w-4 text-sidebar-foreground/60 mr-2" />
                <p className="text-xs text-sidebar-foreground/60">Notes</p>
              </div>
              <p className="text-sm text-sidebar-foreground/80 min-h-[100px]">
                {contact.notes || 'No notes available'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}