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
import toast from 'sonner'
import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { truncateText } from '@/lib/utils'

type Dept = {
  id: string
  name: string
  employeeCount: number
  description?: string
}

const depSchema = z.object({
  id: z.string(),
  name: z.string(),
  employeeCount: z.number(),
  description: z.string().optional()
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
    header: 'Description',
    cell: ({ row }) => {
      const description = row.original.description;
      const [isDescriptionModalOpen, setIsDescriptionModalOpen] = React.useState(false); // State for this specific modal

      const truncated = truncateText(description, 10); // Adjust maxLength as needed

      return (
        <>
          <span>{truncated}</span>
          {description && description.length > 10 && ( // Only show "View More" if truncation occurred
            <Button
              variant="link"
              size="sm"
              onClick={() => setIsDescriptionModalOpen(true)}
              className="p-0 h-auto ml-2" // Adjust styling as needed
            >
              View More
            </Button>
          )}

          {/* Dialog for full description */}
          <Dialog open={isDescriptionModalOpen} onOpenChange={setIsDescriptionModalOpen}>
            <DialogContent className="sm:max-w-md bg-sidebar text-sidebar-foreground">
              <DialogHeader>
                <DialogTitle>Department Description</DialogTitle>
                <DialogDescription>
                  {description || 'No description provided.'}
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
    id: 'actions',
    cell: ({ row }) => {
      const del = useDeleteDepartment();
      const router = useRouter();
      const [isPermissionModalOpen, setIsPermissionModalOpen] = React.useState(false); // State for permission modal

      // You can add a loading state check for 'del' mutation if needed
      // const isDeleting = del.isLoading;

      const handleDelete = async () => {
        // Implement your actual delete logic here, potentially checking permissions first
        // For demonstration, we'll keep the permission modal as is.
        // If you were to enable deletion, it might look like this:
        // try {
        //   await del.mutateAsync(row.original.id);
        //   toast.success("Department Deleted");
        // } catch (error) {
        //   toast.error("Failed to delete department.");
        // } finally {
        //   setIsPermissionModalOpen(false); // Close modal after action
        // }
        setIsPermissionModalOpen(true); // Open "no permission" modal for now
      };

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
            onClick={handleDelete}
          // disabled={isDeleting} // Disable button while deleting
          >
            <Trash2 />
          </Button>
          <Dialog open={isPermissionModalOpen} onOpenChange={setIsPermissionModalOpen}>
            <DialogContent className="sm:max-w-md bg-sidebar text-sidebar-foreground">
              <DialogHeader>
                <DialogTitle>You Don&apos;t Have Delete Permission</DialogTitle>
                <DialogDescription>
                  Sorry, you cannot perform this action. Please try again later with delete permissions.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  onClick={() => setIsPermissionModalOpen(false)}
                  className="bg-sidebar-accent hover:bg-sidebar-primary text-sidebar-accent-foreground"
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      );
    },
  },
];

export default function DepartmentTable() {
  const { data, isLoading } = useDepartments();

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-lg bg-sidebar" />;
  }

  return (
    <DataTable
      data={data || []}
      columns={departmentColumns}
      schema={depSchema}
      typeName='Departments'
    />
  );
}