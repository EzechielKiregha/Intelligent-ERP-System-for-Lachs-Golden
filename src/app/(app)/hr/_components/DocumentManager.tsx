'use client'
import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2, FileText, Upload } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { z } from 'zod'
import { DataTable, DragHandle } from '../../_components/ReusableDataTable'
import { useDeleteDocument, useDocuments } from '@/lib/hooks/hr'

type DC = {
  id: string
  title: string
  fileUrl: string
  description?: string
  uploadedAt: string
  owner?: { firstName: string; lastName: string }
}

const dcSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  fileUrl: z.string().url(),
  description: z.string().optional(),
  uploadedAt: z.string(),
  owner: z.object({
    firstName: z.string(), lastName: z.string()
  }),
})

export const documentColumns: ColumnDef<DC>[] = [
  { id: 'drag', header: () => null, cell: ({ row }) => <DragHandle id={row.original.id} /> },
  { id: 'select', header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={v => table.toggleAllPageRowsSelected(!!v)} />, cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={v => row.toggleSelected(!!v)} />, enableSorting: false },
  { accessorKey: 'title', header: 'Title' },
  { accessorKey: 'owner', header: 'Owner', cell: ({ row }) => row.original.owner ? `${row.original.owner.firstName} ${row.original.owner.lastName}` : '—' },
  { accessorKey: 'uploadedAt', header: 'Uploaded', cell: ({ row }) => format(new Date(row.original.uploadedAt), 'yyyy-MM-dd') },
  { id: 'actions', cell: ({ row }) => { const del = useDeleteDocument(); return (<div className="flex gap-2"><Link href={`/hr/documents/manage?id=${row.original.id}`}><Button size="icon" variant="ghost"><Edit2 /></Button></Link><Button size="icon" variant="ghost" onClick={() => del.mutate(row.original.id)}><Trash2 /></Button></div>) } }
]

export default function DocumentManager() {
  const { data, isLoading } = useDocuments()
  if (isLoading) return <p>Loading documents…</p>
  return <DataTable data={data || []} columns={documentColumns} schema={dcSchema} typeName='Documents' />
}
