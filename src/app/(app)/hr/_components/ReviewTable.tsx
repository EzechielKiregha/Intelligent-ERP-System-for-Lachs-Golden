'use client'
import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2, Star } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { useDeleteReview, useReviews } from '@/lib/hooks/hr'
import { DataTable, DragHandle } from '../../_components/ReusableDataTable'
import { z } from 'zod'
import { Skeleton } from '@/components/ui/skeleton'
import toast from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import React from 'react'
import { truncateText } from '@/lib/utils'

type RV = {
  id: string
  reviewDate: string
  rating: 'EXCEEDS' | 'MEETS' | 'NEEDS_IMPROVEMENT'
  comments: string
  reviewer?: { name: string }
  employee?: { firstName: string; lastName: string }
}
const rvSchema = z.object({
  id: z.string(),
  reviewDate: z.string(),
  rating: z.enum(['EXCEEDS', 'MEETS', 'NEEDS_IMPROVEMENT']),
  comments: z.string().min(1),
  reviewerId: z.string().optional(),
  employeeId: z.string().optional(),
})

export const reviewColumns: ColumnDef<RV>[] = [
  { id: 'drag', header: () => null, cell: ({ row }) => <DragHandle id={row.original.id} /> },
  { id: 'select', header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected()} onCheckedChange={v => table.toggleAllPageRowsSelected(!!v)} />, cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={v => row.toggleSelected(!!v)} />, enableSorting: false },
  { accessorKey: 'reviewDate', header: 'Date', cell: ({ row }) => format(new Date(row.original.reviewDate), 'yyyy-MM-dd') },
  { id: 'emp', header: 'Employee', cell: ({ row }) => row.original.employee ? `${row.original.employee.firstName} ${row.original.employee.lastName}` : '—' },
  { id: 'rev', header: 'Reviewer', cell: ({ row }) => row.original.reviewer?.name || '—' },
  { accessorKey: 'rating', header: 'Rating', cell: ({ row }) => <div className="flex items-center gap-1"><Star className="w-4 h-4 text-sidebar-primary" /> {row.original.rating}</div> },
  {
    accessorKey: 'comments',
    header: 'Description',
    cell: ({ row }) => {
      const comments = row.original.comments;
      const [isDescriptionModalOpen, setIsDescriptionModalOpen] = React.useState(false); // State for this specific modal

      const truncated = truncateText(comments, 10); // Adjust maxLength as needed

      return (
        <>
          <span>{truncated}</span>
          {comments && comments.length > 10 && ( // Only show "View More" if truncation occurred
            <Button
              variant="link"
              size="sm"
              onClick={() => setIsDescriptionModalOpen(true)}
              className="p-0 h-auto ml-2" // Adjust styling as needed
            >
              View More
            </Button>
          )}

          {/* Dialog for full comments */}
          <Dialog open={isDescriptionModalOpen} onOpenChange={setIsDescriptionModalOpen}>
            <DialogContent className="sm:max-w-md bg-sidebar text-sidebar-foreground">
              <DialogHeader>
                <DialogTitle>Department Description</DialogTitle>
                <DialogDescription>
                  {comments || 'No description provided.'}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  onClick={() => setIsDescriptionModalOpen(false)}
                  className="bg-sidebar-accent hover:bg-sidebar-primary text-sidebar-accent-foreground"
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
  {
    id: 'actions', cell: ({ row }) => {
      const del = useDeleteReview();
      const [isModalOpen, setIsModalOpen] = React.useState(false);
      return (
        <div className="flex gap-2">
          <Link href={`/hr/reviews/manage?id=${row.original.id}`}>
            <Button variant="ghost" size="icon">
              <Edit2 />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              // del.mutate(row.original.id)
              // if (del.isSuccess) toast.success("Review Deleted");
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

export default function ReviewTable() {
  const { data, isLoading } = useReviews()
  if (isLoading) {
    return <Skeleton className="h-40 w-full rounded-lg bg-sidebar" />
  }
  return <DataTable data={data || []} columns={reviewColumns} schema={rvSchema} typeName='Permance Reviews' />
}
