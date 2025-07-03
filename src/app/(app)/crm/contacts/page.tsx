// app/crm/contacts/page.tsx
'use client'

import React from 'react'
import ContactTable from './_components/ContactTable'
import ManageContactFormPopover from '../_components/ManageContactFormPopover'

export default function ContactsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Leads, Contacts, Partners
        </h3>
        {/* New-contact popover */}
        <ManageContactFormPopover />
      </div>

      <ContactTable />
    </div>
  )
}
