'use client'
import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { DataTable, DragHandle } from '../../_components/ReusableDataTable'
import { useDeleteTask, useTasks } from '@/lib/hooks/hr'
import { z } from 'zod'
import { Skeleton } from '@/components/ui/skeleton'
import toast from 'sonner'
import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type TK = {
  id: string
  title: string
  status: string
  dueDate: string | null
  assignee?: { firstName: string; lastName: string }
}

const tkSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED']),
  dueDate: z.string().nullable(),
  assigneeId: z.object({
    firstName: z.string(),
    lastName: z.string()
  }),
})

export const taskColumns: ColumnDef<TK>[] = [
  { id: 'drag', header: () => null, cell: ({ row }) => <DragHandle id={row.original.id} /> },
  { id: 'select', header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={v => table.toggleAllPageRowsSelected(!!v)} />, cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={v => row.toggleSelected(!!v)} />, enableSorting: false },
  { accessorKey: 'title', header: 'Title' },
  { id: 'assignee', header: 'Assignee', cell: ({ row }) => row.original.assignee ? `${row.original.assignee.firstName} ${row.original.assignee.lastName}` : '—' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'dueDate', header: 'Due', cell: ({ row }) => row.original.dueDate ? format(new Date(row.original.dueDate), 'yyyy-MM-dd') : '—' },
  {
    id: 'actions', cell: ({ row }) => {
      const [isModalOpen, setIsModalOpen] = React.useState(false);
      const del = useDeleteTask(); return <div className="flex gap-2"><Link href={`/hr/tasks/manage?id=${row.original.id}`}><Button size="icon" variant="ghost"><Edit2 /></Button></Link><Button
        variant="ghost"
        size="icon"
        onClick={() => {
          // del.mutate(row.original.id)
          // if (del.isSuccess) toast.success("Task Deleted");
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
    }
  }
]

export default function TaskList() {
  const { data, isLoading } = useTasks()
  if (isLoading) {
    return <Skeleton className="h-40 w-full rounded-lg bg-sidebar" />
  }
  return <DataTable data={data || []} columns={taskColumns} schema={tkSchema} typeName='Tasks' />
}
