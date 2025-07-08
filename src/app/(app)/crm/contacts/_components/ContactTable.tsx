// app/crm/_components/ContactTable.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2, User } from 'lucide-react'
import { useContacts, useDeleteContact } from '@/lib/hooks/crm'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DataTable, DragHandle } from '@/app/(app)/_components/ReusableDataTable'

// 1. Define the shape of each row
type Contact = {
  id: string
  fullName: string
  email: string
  phone?: string
  jobTitle?: string
  createdAt: string
}
const contactSchema = z.object({
  id: z.string(),
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string()
})

// 2. Column definitions
export const contactColumns: ColumnDef<Contact>[] = [
  { id: 'drag', header: () => null, cell: ({ row }) => <DragHandle id={row.original.id} /> },
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={v => table.toggleAllPageRowsSelected(!!v)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={v => row.toggleSelected(!!v)}
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'fullName',
    header: 'Name',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <User className="h-5 w-5 text-gray-400" />
        <span>{row.original.fullName}</span>
      </div>
    ),
  },
  { accessorKey: 'email', header: 'Email' },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => row.original.phone || '—',
  },
  {
    accessorKey: 'jobTitle',
    header: 'Job Title',
    cell: ({ row }) => row.original.jobTitle || '—',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const deleteContact = useDeleteContact()
      const [isOpen, setIsOpen] = React.useState(false)

      return (
        <div className="flex gap-2">
          <Link href={`/crm/contacts/manage?id=${row.original.id}`}>
            <Button size="icon" variant="ghost"><Edit2 /></Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
          >
            <Trash2 />
          </Button>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md bg-sidebar text-sidebar-foreground">
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete <strong>{row.original.fullName}</strong>?
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    deleteContact.mutate(row.original.id, {
                      onSuccess: () => {
                        toast.success('Contact deleted')
                        setIsOpen(false)
                      },
                      onError: () => toast.error('Failed to delete'),
                    })
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )
    },
  },
]

// 3. ContactTable component
export default function ContactTable() {
  const { data, isLoading } = useContacts()

  if (isLoading) {
    return <Skeleton className="h-40 w-full rounded-lg bg-sidebar" />
  }

  return (
    <DataTable
      data={data || []}
      columns={contactColumns}
      schema={contactSchema}
      typeName="Contacts"
    />
  )
}
