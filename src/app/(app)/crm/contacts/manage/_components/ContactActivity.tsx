// app/crm/contacts/manage/_components/ContactActivity.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Mail, Phone, Video, MessageSquare, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { useCommunicationLogsByContactId } from '@/lib/hooks/crm';
import CommunicationLogFormPopover from './CommunicationLogFormPopover';

interface ContactActivityProps {
  contactId: string;
}

// Map communication type to icon and color
const getLogIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'email': return <Mail className="h-4 w-4" />;
    case 'call': return <Phone className="h-4 w-4" />;
    case 'meeting': return <Video className="h-4 w-4" />;
    default: return <MessageSquare className="h-4 w-4" />;
  }
};

const getLogColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'email': return 'text-blue-400';
    case 'call': return 'text-green-400';
    case 'meeting': return 'text-purple-400';
    default: return 'text-sidebar-foreground/70';
  }
};

export default function ContactActivity({ contactId }: ContactActivityProps) {
  const { data: logs = [], isLoading } = useCommunicationLogsByContactId(contactId);

  if (isLoading) {
    return (
      <Card className="bg-sidebar border-[var(--sidebar-border)]">
        <CardHeader>
          <CardTitle className="text-sidebar-foreground">Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sidebar-foreground/70">Loading activity...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-sidebar border-[var(--sidebar-border)]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold text-sidebar-foreground">
          Activity
        </CardTitle>
        <CommunicationLogFormPopover contactId={contactId}>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Log Activity
          </Button>
        </CommunicationLogFormPopover>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-sidebar-foreground/70">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No activity logged yet</p>
            <p className="text-sm mt-1">Start tracking your interactions with this contact</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log: any) => (
              <div key={log.id} className="border-l-2 border-sidebar-accent pl-4 py-2">
                <div className="flex items-start">
                  <div className={`mt-1 ${getLogColor(log.type)}`}>
                    {getLogIcon(log.type)}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-sidebar-foreground">
                        {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                        {log.direction && ` (${log.direction})`}
                      </h3>
                      <span className="text-xs text-sidebar-foreground/60 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    {log.message && (
                      <p className="mt-1 text-sm text-sidebar-foreground/80 line-clamp-2">
                        {log.message}
                      </p>
                    )}
                    <div className="mt-2 flex items-center text-xs text-sidebar-foreground/60">
                      <User className="h-3 w-3 mr-1" />
                      You
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}