
'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import BasePopover from '@/components/BasePopover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useCreateContact, useUpdateContact, useContacts } from '@/lib/hooks/crm'

// Zod schema for contact validation
export const contactSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  notes: z.string().optional(),
})

type ContactForm = z.infer<typeof contactSchema>

interface ManageContactFormProps {
  contactToEdit?: ContactForm & { id: string }
}

export default function ManageContactForm({ contactToEdit }: ManageContactFormProps) {
  const isEdit = Boolean(contactToEdit)
  const [fullName, setFullName] = useState(contactToEdit?.fullName || '')
  const [email, setEmail] = useState(contactToEdit?.email || '')
  const [phone, setPhone] = useState(contactToEdit?.phone || '')
  const [jobTitle, setJobTitle] = useState(contactToEdit?.jobTitle || '')
  const [notes, setNotes] = useState(contactToEdit?.notes || '')

  const createContact = useCreateContact()
  const updateContact = useUpdateContact()

  const handleSubmit = async () => {
    try {
      const data: ContactForm = { fullName, email, phone, jobTitle, notes }
      contactSchema.parse(data)

      if (isEdit && contactToEdit) {
        await updateContact.mutateAsync({ id: contactToEdit.id, ...data })
        toast.success('Contact updated successfully')
      } else {
        await createContact.mutateAsync(data)
        toast.success('Contact created successfully')
      }

      // Reset fields only on create
      if (!isEdit) {
        setFullName('')
        setEmail('')
        setPhone('')
        setJobTitle('')
        setNotes('')
      }
    } catch (err: any) {
      const message = err?.errors?.[0]?.message || 'Validation or server error'
      toast.error(message)
    }
  }

  return (
    <BasePopover
      title={isEdit ? 'Edit Contact' : 'New Contact'}
      buttonLabel={isEdit ? 'Edit Contact' : 'Add Contact'}
    >
      <div className="w-full max-w-lg space-y-4">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="e.g. Jane Doe"
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="e.g. jane.doe@example.com"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="e.g. +1234567890"
          />
        </div>

        <div>
          <Label htmlFor="jobTitle">Job Title</Label>
          <Input
            id="jobTitle"
            value={jobTitle}
            onChange={e => setJobTitle(e.target.value)}
            placeholder="e.g. Account Manager"
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Additional information..."
          />
        </div>

        <div className="pt-3">
          <Button
            onClick={handleSubmit}
            className="w-full bg-sidebar-accent hover:bg-sidebar-primary text-sidebar-accent-foreground"
          >
            {isEdit ? 'Update Contact' : 'Create Contact'}
          </Button>
        </div>
      </div>
    </BasePopover>
  )
}
