'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axiosdb from 'axios'
import ContactTable from '../_components/ContactTable'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import ManageContactForm, { contactSchema } from '../_components/ManageContactForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ManageContactFormPopover from '../../_components/ManageContactFormPopover'

type Contact = z.infer<typeof contactSchema> & { id: string }

export default function ContactsPage() {
  const params = useSearchParams()
  const router = useRouter()
  const editId = params.get('id')

  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null)
  const [loadingEdit, setLoadingEdit] = useState(false)

  useEffect(() => {
    if (editId) {
      setLoadingEdit(true)
      axiosdb
        .get<Contact>(`/api/crm/contacts/${editId}`)
        .then((res) => {
          setContactToEdit(res.data)
        })
        .catch((err) => {
          toast.error(err.response?.data?.error || 'Failed to load contact')
          router.replace('/crm/contacts') // remove ?id
        })
        .finally(() => setLoadingEdit(false))
    }
  }, [editId, router])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Link href="/crm/contacts" className="flex items-center gap-2 text-sidebar-primary hover:text-sidebar-accent">
          <ArrowLeft size={16} /> Back to Leads, Contacts, Partners
        </Link>
        <h1 className="text-2xl font-semibold text-sidebar-foreground">
          {editId ? 'Edit Contact' : 'New Contact'}
        </h1>
      </div>

      {/* New-contact popover */}
      <div className="flex my-1 justify-center items-center">
        <ManageContactFormPopover />
      </div>
      {/* Edit-contact popover when ?id= is present */}
      {editId && !loadingEdit && contactToEdit && (
        <ManageContactForm contactToEdit={contactToEdit} />
      )}

      <ContactTable />
    </div>
  )
}
