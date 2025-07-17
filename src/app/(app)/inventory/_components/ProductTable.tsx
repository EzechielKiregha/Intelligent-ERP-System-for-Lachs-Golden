'use client'

import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconDotsVertical } from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { useDeleteProduct, useProducts } from "@/lib/hooks/inventory";
import SkeletonLoader from "../../_components/SkeletonLoader";
import { DataTable, DragHandle, TableCellViewer } from "../../_components/ReusableDataTable";
import { truncateText } from "@/lib/utils";
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { Role } from "@/generated/prisma";
import { useAuth } from "contents/authContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Edit2, Trash2 } from "lucide-react";

// 1. Schema
export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string(),
  quantity: z.number(),
  threshold: z.number(),
  description: z.string().optional(),
  unitPrice: z.number()
});

// 2. Columns
export const productColumns: ColumnDef<z.infer<typeof productSchema>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
  },
  {
    accessorKey: "name",
    header: "Product",
    cell: ({ row }) => (
      <TableCellViewer
        item={{
          id: row.original.id,
          category: row.original.name,
          type: row.original.sku,
          quantity: row.original.quantity,
          threshold: row.original.threshold,
          unitPrice: row.original.unitPrice
        }}
        typeName="Products"
      />
    ),
  },
  {
    accessorKey: "unitPrice",
    header: () => <div className="text-right">Unit Price</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono">{row.original.unitPrice}</div>
    ),
  },
  {
    accessorKey: "quantity",
    header: () => <div className="text-right">Qty</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono">{row.original.quantity}</div>
    ),
  },
  {
    accessorKey: "threshold",
    header: () => <div className="text-right">Threshold</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono">{row.original.threshold}</div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.original.description || '';
      const [isDescriptionModalOpen, setIsDescriptionModalOpen] = React.useState(false); // State for this specific modal

      const truncated = truncateText(description, 10); // Adjust maxLength as needed
      return (
        <>
          {description && description.length > 20 && ( // Only show "View More" if truncation occurred
            <Button
              variant="link"
              size="sm"
              onClick={() => setIsDescriptionModalOpen(true)}
              className="p-0 h-auto  ml-2" // Adjust styling as needed
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
          </Dialog></>
      );
    }
  },
  {
    id: 'actions', cell: ({ row }) => {
      const router = useRouter(), del = useDeleteProduct(row.original.id)
      return <div className="flex gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/inventory/manage?id=${row.original.id}`)}><Edit2 /></Button>
        <Button variant="ghost" size="icon" onClick={() => del.mutate()}><Trash2 /></Button>
      </div>
    }
  },
];

// 3. Component
export default function ProductsTable() {
  const { data: products, isLoading, error } = useProducts();

  if (isLoading) return <SkeletonLoader type="card" height={60} count={1} col={1} />;
  if (error) {
    return (
      <div className="bg-sidebar text-sidebar-foreground p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold">No Products Found</h3>
        <p className="text-sm">
          Start managing your company&apos;s products by adding a product.
        </p>
        <div className="mt-4 space-y-2 flex flex-row justify-between items-start">
          <Link href="/inventory/manage" className="text-sm text-[#A17E25] hover:underline dark:text-[#D4AF37]">
            Create a Product
          </Link>
        </div>
      </div>
    );
  };

  return (
    <DataTable
      data={products || []}
      columns={productColumns}
      schema={productSchema}
      typeName="Products"
    />
  );
}
