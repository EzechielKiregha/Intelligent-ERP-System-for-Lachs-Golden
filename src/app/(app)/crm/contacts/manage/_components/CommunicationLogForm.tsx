// app/crm/contacts/manage/_components/CommunicationLogForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateCommunicationLog } from '@/lib/hooks/crm';
import { toast } from 'sonner';

interface CommunicationLogFormProps {
  contactId?: string;
  onSuccess?: () => void;
}

export default function CommunicationLogForm({
  contactId,
  onSuccess
}: CommunicationLogFormProps) {
  const [formData, setFormData] = useState({
    type: 'email',
    direction: 'outgoing',
    message: '',
  });

  const createLog = useCreateCommunicationLog();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createLog.mutate(
      {
        ...formData,
        contactId,
        timestamp: new Date().toISOString()
      },
      {
        onSuccess: () => {
          toast.success('Communication logged successfully');
          onSuccess?.();
        },
        onError: () => {
          toast.error('Failed to log communication');
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 border border-[var(--sidebar-border)] rounded bg-sidebar text-sidebar-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-accent"
          >
            <option value="email">Email</option>
            <option value="call">Call</option>
            <option value="meeting">Meeting</option>
            <option value="note">Note</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="direction">Direction</Label>
          <select
            id="direction"
            name="direction"
            value={formData.direction}
            onChange={handleChange}
            className="w-full p-2 border border-[var(--sidebar-border)] rounded bg-sidebar text-sidebar-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-accent"
          >
            <option value="outgoing">Outgoing</option>
            <option value="incoming">Incoming</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Details</Label>
        <Textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Describe the communication details..."
          className="min-h-[100px]"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90"
        disabled={createLog.isPending}
      >
        {createLog.isPending ? 'Saving...' : 'Save Log'}
      </Button>
    </form>
  );
}