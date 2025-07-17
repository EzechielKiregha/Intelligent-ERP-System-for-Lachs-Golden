// components/inventory/ProductListTable.tsx
'use client'

import { z } from "zod";
import { ColumnDef } from '@tanstack/react-table'
import { useProducts } from '@/lib/hooks/inventory'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useDeleteProduct } from '@/lib/hooks/inventory'
import { DataTable, DragHandle, TableCellViewer } from '../../_components/ReusableDataTable'
import SkeletonLoader from "../../_components/SkeletonLoader";


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

type Prod = { id: string, name: string, sku: string, quantity: number, threshold: number, description?: string }
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
    id: 'actions', cell: ({ row }) => {
      const router = useRouter(), del = useDeleteProduct(row.original.id)
      return <div className="flex gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/inventory/manage?id=${row.original.id}`)}><Edit2 /></Button>
        <Button variant="ghost" size="icon" onClick={() => del.mutate()}><Trash2 /></Button>
      </div>
    }
  }
];

export default function ProductListTable() {
  const { data: products, isLoading, error } = useProducts();

  if (isLoading) return <SkeletonLoader type="card" height={60} count={1} col={1} />;
  // if (error) return <div className="text-red-500">Error loading products.</div>;

  return (
    <DataTable
      data={products || []}
      columns={productColumns}
      schema={productSchema}
      typeName="Products"
    />
  );
}
