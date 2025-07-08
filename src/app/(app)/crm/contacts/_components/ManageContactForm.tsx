
'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useCreateContact, useUpdateContact } from '@/lib/hooks/crm'

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
  standalone?: boolean
}

export default function ManageContactForm({ contactToEdit, standalone }: ManageContactFormProps) {
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
    <div className="w-full max-w-3xl space-y-6 text-sidebar-foreground">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fullName" className="text-sidebar-foreground">Full Name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="e.g. Jane Doe"
            className="bg-sidebar text-sidebar-foreground"
          />
        </div>

        <div>
          <Label htmlFor="email" className="text-sidebar-foreground">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="e.g. jane.doe@example.com"
            className="bg-sidebar text-sidebar-foreground"
          />
        </div>

        <div>
          <Label htmlFor="phone" className="text-sidebar-foreground">Phone</Label>
          <Input
            id="phone"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="e.g. +1234567890"
            className="bg-sidebar text-sidebar-foreground"
          />
        </div>

        <div>
          <Label htmlFor="jobTitle" className="text-sidebar-foreground">Job Title</Label>
          <Input
            id="jobTitle"
            value={jobTitle}
            onChange={e => setJobTitle(e.target.value)}
            placeholder="e.g. Account Manager"
            className="bg-sidebar text-sidebar-foreground"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes" className="text-sidebar-foreground">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Additional information..."
          className="bg-sidebar text-sidebar-foreground"
        />
      </div>

      <div className="pt-4">
        <Button
          onClick={handleSubmit}
          className="w-full bg-sidebar-accent hover:bg-sidebar-primary text-sidebar-accent-foreground"
        >
          {isEdit ? 'Update Contact' : 'Create Contact'}
        </Button>
      </div>
    </div>
  )
}
