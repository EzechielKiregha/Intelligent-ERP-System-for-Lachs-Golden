'use client'
import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2, Calendar as CalIcon } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { DataTable, DragHandle } from '../../_components/ReusableDataTable'
import { useDeletePayroll, usePayrolls } from '@/lib/hooks/hr'
import { z } from 'zod'
import { Skeleton } from '@/components/ui/skeleton'
import toast from 'sonner'
import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type PR = {
  id: string
  grossAmount: number
  taxAmount: number | null
  netAmount: number | null
  issuedDate: string | null
  notes: string | null
  employee: { firstName: string; lastName: string }
}

const payrollSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  payPeriod: z.string().nullable(),
  grossAmount: z.number().min(0),
  taxAmount: z.number().nullable(),
  netAmount: z.number().nullable(),
  issuedDate: z.string().nullable(),
  notes: z.string().nullable(),
  employee: z.object(
    { firstName: z.string(), lastName: z.string() }
  )
})

export const payrollColumns: ColumnDef<PR>[] = [
  { id: 'drag', header: () => null, cell: ({ row }) => <DragHandle id={row.original.id} /> },
  {
    id: 'select',
    header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={v => table.toggleAllPageRowsSelected(!!v)} />,
    cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={v => row.toggleSelected(!!v)} />,
    enableSorting: false
  },
  {
    accessorKey: 'employee',
    header: 'Employee',
    cell: ({ row }) => `${row.original.employee.firstName} ${row.original.employee.lastName}`
  },
  {
    accessorKey: 'issuedDate',
    header: 'Issued',
    cell: ({ row }) => row.original.issuedDate
      ? format(new Date(row.original.issuedDate), 'yyyy-MM-dd')
      : '—'
  },
  {
    accessorKey: 'netAmount',
    header: 'Net',
    cell: ({ row }) => `$${row.original.netAmount?.toFixed(2) ?? '0.00'}`
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const del = useDeletePayroll()
      const [isModalOpen, setIsModalOpen] = React.useState(false);
      return (
        <div className="flex gap-2">
          <Link href={`/hr/payroll/manage?id=${row.original.id}`}>
            <Button size="icon" variant="ghost"><Edit2 /></Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              // del.mutate(row.original.id)
              // if (del.isSuccess) toast.success("Payroll Deleted");
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

export default function PayrollTable() {
  const { data, isLoading } = usePayrolls()
  if (isLoading) {
    return <Skeleton className="h-40 w-full rounded-lg bg-sidebar" />
  }
  return <DataTable data={data || []} columns={payrollColumns} schema={payrollSchema} typeName='Payrolls' />
}
