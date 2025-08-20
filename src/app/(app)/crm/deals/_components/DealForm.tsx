// app/crm/deals/_components/DealForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateDeal, useUpdateDeal } from '@/lib/hooks/crm';
import { toast } from 'sonner';
import { useContacts } from '@/lib/hooks/crm';
import { Contact, Deal } from '../types/types';
import { DealStage } from '@/generated/prisma';

interface DealFormProps {
  deal?: Deal | null;
  onSuccess?: () => void;
  contactId?: string; // New: Pre-select contact
}

const STAGES: DealStage[] = [
  'NEW',
  'QUALIFIED',
  'PROPOSAL',
  'NEGOTIATION',
  'WON',
  'LOST'
];

export default function DealForm({
  deal,
  onSuccess,
  contactId: preSelectedContactId
}: DealFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    amount: 0,
    stage: 'NEW' as DealStage,
    contactId: preSelectedContactId || '',
  });

  const createDeal = useCreateDeal();
  const updateDeal = useUpdateDeal();
  const { data: contacts = [], isLoading: isContactsLoading } = useContacts();

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title,
        amount: deal.amount,
        stage: deal.stage,
        contactId: deal.contactId,
      });
    } else if (preSelectedContactId) {
      // If coming from contact page, keep pre-selected contact
      setFormData(prev => ({ ...prev, contactId: preSelectedContactId }));
    } else {
      setFormData({
        title: '',
        amount: 0,
        stage: 'NEW',
        contactId: '',
      });
    }
  }, [deal, preSelectedContactId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      toast.error('Title is required');
      return;
    }

    if (formData.amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    if (!formData.contactId) {
      toast.error('Contact is required');
      return;
    }

    if (deal) {
      updateDeal.mutate(
        { id: deal.id, ...formData },
        {
          onSuccess: () => {
            toast.success('Deal updated successfully');
            onSuccess?.();
          },
          onError: () => {
            toast.error('Failed to update deal');
          },
        }
      );
    } else {
      createDeal.mutate(formData, {
        onSuccess: () => {
          toast.success('Deal created successfully');
          onSuccess?.();
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.error || 'Failed to create deal';
          toast.error(errorMessage);
        },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Deal Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enterprise Software Package"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount ($)</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            placeholder="5000.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stage">Stage</Label>
          <select
            id="stage"
            name="stage"
            value={formData.stage}
            onChange={handleChange}
            className="w-full p-2 border border-[var(--sidebar-border)] rounded bg-sidebar text-sidebar-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-accent"
          >
            {STAGES.map(stage => (
              <option key={stage} value={stage}>
                {stage.charAt(0) + stage.slice(1).toLowerCase().replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactId">Contact</Label>
        {isContactsLoading ? (
          <div className="animate-pulse h-10 bg-sidebar-accent/20 rounded" />
        ) : (
          <select
            id="contactId"
            name="contactId"
            value={formData.contactId}
            onChange={handleChange}
            disabled={!!preSelectedContactId} // Lock if pre-selected
            className={`w-full p-2 border border-[var(--sidebar-border)] rounded bg-sidebar text-sidebar-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-accent ${preSelectedContactId ? 'opacity-75 cursor-not-allowed' : ''
              }`}
          >
            <option value="">Select a contact</option>
            {contacts.map((contact: Contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.fullName} - {contact.companyName || 'N/A'}
              </option>
            ))}
          </select>
        )}
        {preSelectedContactId && (
          <p className="text-xs text-sidebar-foreground/60 mt-1">
            Contact is pre-selected from contact page
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90"
        disabled={createDeal.isPending || updateDeal.isPending || isContactsLoading}
      >
        {createDeal.isPending || updateDeal.isPending
          ? 'Saving...'
          : deal
            ? 'Update Deal'
            : 'Create Deal'}
      </Button>
    </form>
  );
}