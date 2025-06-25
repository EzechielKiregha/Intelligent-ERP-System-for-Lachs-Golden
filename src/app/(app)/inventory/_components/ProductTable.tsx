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
import { useProducts } from "@/lib/hooks/inventory";
import SkeletonLoader from "../../_components/SkeletonLoader";
import { DataTable, DragHandle, TableCellViewer } from "../../_components/ReusableDataTable";

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
    cell: ({ row }) => (
      <div className="text-muted-foreground text-sm">
        {row.original.description || "N/A"}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
            size="icon"
          >
            <IconDotsVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem
            onClick={() =>
              window.location.href = `/inventory/manage?id=${row.original.id}`
            }
          >
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

// 3. Component
export default function ProductsTable() {
  const { data: products, isLoading, error } = useProducts();

  if (isLoading) return <SkeletonLoader type="card" height={60} count={1} col={1} />;
  if (error) return <div className="text-red-500">Error loading products.</div>;

  return (
    <DataTable
      data={products || []}
      columns={productColumns}
      schema={productSchema}
      typeName="Products"
    />
  );
}
