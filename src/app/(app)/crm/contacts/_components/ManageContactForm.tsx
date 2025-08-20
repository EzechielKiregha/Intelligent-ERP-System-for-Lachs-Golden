// app/crm/contacts/_components/ManageContactForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateContact, useUpdateContact } from '@/lib/hooks/crm';
import { toast } from 'sonner';
import { Contact } from '@/lib/hooks/crm';

interface ManageContactFormProps {
  contact?: Contact | null;
  onSuccess?: () => void;
}

export default function ManageContactForm({ contact, onSuccess }: ManageContactFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    jobTitle: '',
    notes: '',
  });

  const createContact = useCreateContact();
  const updateContact = useUpdateContact();

  useEffect(() => {
    if (contact) {
      setFormData({
        fullName: contact.fullName,
        email: contact.email,
        phone: contact.phone || '',
        companyName: contact.companyName || '',
        jobTitle: contact.jobTitle || '',
        notes: contact.notes || '',
      });
    } else {
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        companyName: '',
        jobTitle: '',
        notes: '',
      });
    }
  }, [contact]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      toast.error('Email is required');
      return;
    }

    if (contact) {
      updateContact.mutate(
        { id: contact.id, ...formData },
        {
          onSuccess: () => {
            toast.success('Contact updated successfully');
            onSuccess?.();
          },
          onError: () => {
            toast.error('Failed to update contact');
          },
        }
      );
    } else {
      createContact.mutate(formData, {
        onSuccess: () => {
          toast.success('Contact created successfully');
          onSuccess?.();
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.error || 'Failed to create contact';
          toast.error(errorMessage);
        },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyName">Company</Label>
          <Input
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Company Inc."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="jobTitle">Job Title</Label>
          <Input
            id="jobTitle"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            placeholder="Software Engineer"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Additional notes about this contact..."
          className="w-full min-h-[100px] p-2 border border-[var(--sidebar-border)] rounded bg-sidebar text-sidebar-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-accent"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90"
        disabled={createContact.isPending || updateContact.isPending}
      >
        {createContact.isPending || updateContact.isPending
          ? 'Saving...'
          : contact
            ? 'Update Contact'
            : 'Create Contact'}
      </Button>
    </form>
  );
}