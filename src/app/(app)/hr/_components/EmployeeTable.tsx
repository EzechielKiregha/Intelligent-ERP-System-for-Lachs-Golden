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
import { Skeleton } from '@/components/ui/skeleton'
import toast from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import React from 'react'

type Emp = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  hireDate?: string
  jobTitle?: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
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
      const [isModalOpen, setIsModalOpen] = React.useState(false);
      return (
        <div className="flex gap-2">
          <Link href={`/hr/employees/manage?id=${row.original.id}`}>
            <Button size="icon" variant="ghost"><Edit2 /></Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              // del.mutate(row.original.id)
              // if (del.isSuccess) toast.success("Employee Deleted");
              // else toast.error("Failed to delete");
              setIsModalOpen(true)
            }
            }
          >
            <Trash2 />
          </Button>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen} >
            <DialogContent className="sm:max-w-md bg-sidebar text-sidebar-foreground">
              <DialogHeader>
                <DialogTitle>You Don&apos;t Have Delete Permission</DialogTitle>
                <DialogDescription>
                  Sorry, you cannot perform this action. Please try again later with delete permissions.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  onClick={() => {
                    setIsModalOpen(false);
                  }}
                  className="bg-sidebar-accent hover:bg-sidebar-primary text-sidebar-accent-foreground"
                >
                  close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )
    }
  }
]

export default function EmployeeTable() {
  const { data, isLoading } = useEmployees()
  if (isLoading) {
    return <Skeleton className="h-40 w-full rounded-lg bg-sidebar" />
  }
  return <DataTable data={data || []} columns={employeeColumns} schema={empSchema} typeName='Employees' />
}
