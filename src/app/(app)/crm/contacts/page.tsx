'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axiosdb from 'axios'
import ContactTable from './_components/ContactTable'
import ManageContactForm, { contactSchema } from './_components/ManageContactForm'
import { z } from 'zod'
import { toast } from 'react-hot-toast'

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
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Leads, Contacts, Partners
        </h3>
        {/* New-contact popover */}
        <ManageContactForm />
      </div>

      {/* Edit-contact popover when ?id= is present */}
      {editId && !loadingEdit && contactToEdit && (
        <ManageContactForm contactToEdit={contactToEdit} />
      )}

      <ContactTable />
    </div>
  )
}
