// app/hr/_components/EmployeeTable.tsx
'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2, User } from 'lucide-react'
import Link from 'next/link'
import { DataTable, DragHandle } from '../../_components/ReusableDataTable'
import { useDeleteEmployee, useEmployees } from '@/lib/hooks/hr'
import { empSchema } from '../employees/_components/ManageEmployeeForm'
import { EmployeeCellViewer } from './EmployeeCellViewer'

type Emp = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  hireDate?: string
  jobTitle?: string
  status: 'ACTIVE' | 'INACTIVE' | 'TERMINATED'
  department: { id: string; name: string } | null
}

export const employeeColumns: ColumnDef<Emp>[] = [
  { id: 'drag', header: () => null, cell: ({ row }) => <DragHandle id={row.original.id} /> },
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={v => table.toggleAllPageRowsSelected(!!v)} />
    ),
    cell: ({ row }) => (
      <Checkbox checked={row.getIsSelected()} onCheckedChange={v => row.toggleSelected(!!v)} />
    ),
    enableSorting: false
  },
  {
    accessorKey: 'firstName',
    header: 'Name',
    cell: ({ row }) => (
      <EmployeeCellViewer
        item={{
          id: row.original.id,
          firstName: row.original.firstName,
          lastName: row.original.lastName,
          email: row.original.email,
          jobTitle: row.original.jobTitle,
          hireDate: row.original.hireDate,
          status: row.original.status,
        }}
      />
    )
  },
  {
    accessorKey: 'email',
    header: 'Email'
  },
  {
    accessorKey: 'department.name',
    header: 'Department',
    cell: ({ row }) => row.original.department?.name || '—'
  },
  {
    accessorKey: 'jobTitle',
    header: 'Job Title',
    cell: ({ row }) => row.original.jobTitle || '—'
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const s = row.original.status
      const color = s === 'ACTIVE' ? 'text-green-600' : 'INACTIVE' === s ? 'text-gray-500' : 'text-red-600'
      return <Badge className={color}>{s}</Badge>
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const del = useDeleteEmployee()
      return (
        <div className="flex gap-2">
          <Link href={`/hr/employees/manage?id=${row.original.id}`}>
            <Button size="icon" variant="ghost"><Edit2 /></Button>
          </Link>
          <Button size="icon" variant="ghost" onClick={() => del.mutate(row.original.id)}>
            <Trash2 />
          </Button>
        </div>
      )
    }
  }
]

export default function EmployeeTable() {
  const { data, isLoading } = useEmployees()
  if (isLoading) return <p>Loading...</p>
  return <DataTable data={data || []} columns={employeeColumns} schema={empSchema} typeName='Employees' />
}
