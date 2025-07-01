'use client'
import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DataTable, DragHandle } from '../../_components/ReusableDataTable'
import { useDeleteDepartment, useDepartments } from '@/lib/hooks/hr'
import { z } from 'zod'
import { Skeleton } from '@/components/ui/skeleton'

type Dept = {
  id: string
  name: string
  description?: string
  employeeCount: number
}

const depSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  employeeCount: z.number()
})

export const departmentColumns: ColumnDef<Dept>[] = [
  { id: 'drag', header: () => null, cell: ({ row }) => <DragHandle id={row.original.id} /> },
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'name',
    header: 'Department',
    cell: ({ row }) => <span>{row.original.name}</span>,
  },
  {
    accessorKey: 'employeeCount',
    header: 'Employees',
    cell: ({ row }) => <span>{row.original.employeeCount}</span>,
  },
  {
    accessorKey: 'description',
    header: 'Department',
    cell: ({ row }) => <span>{row.original.description || '—'}</span>,
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const del = useDeleteDepartment()
      const router = useRouter()
      return (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/hr/departments/manage?id=${row.original.id}`)}
          >
            <Edit2 />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => del.mutate(row.original.id)}
          >
            <Trash2 />
          </Button>
        </div>
      )
    },
  },
]

export default function DepartmentTable() {
  const { data, isLoading } = useDepartments()
  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-lg bg-sidebar" />
  }
  return <DataTable data={data || []} columns={departmentColumns} schema={depSchema} typeName='Departments' />
}
