import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { useFinanceCategories } from "@/lib/hooks/finance";
import { DataTable, DragHandle, TableCellViewer } from "./ReusableDataTable";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IconDotsVertical } from "@tabler/icons-react";

// Category schema
export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["INCOME", "EXPENSE"]),
  budgetLimit: z.number(),
  budgetUsed: z.number(),
});

// Category columns
export const categoryColumns: ColumnDef<z.infer<typeof categorySchema>>[] = [
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
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: () => <div className="w-full text-left">Category</div>,
    cell: ({ row }) => (
      <div className="text-left font-semibold">
        {row.original.name}
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge
          variant="outline"
          className={`px-1.5 border-[var(--sidebar-border)] text-[var(--sidebar-foreground)] ${row.original.type === "INCOME"
            ? "bg-[var(--sidebar-primary)] dark:bg-[var(--sidebar-primary)]"
            : "bg-red-500 dark:bg-red-700"
            }`}
        >
          {row.original.type}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "budgetLimit",
    header: () => <div className="w-full text-right">Budget Limit</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono">
        ${row.original.budgetLimit.toFixed(2)}
      </div>
    ),
  },
  {
    accessorKey: "budgetUsed",
    header: () => <div className="w-full text-right">Budget Used</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono">
        ${row.original.budgetUsed.toFixed(2)}
      </div>
    ),
  },
  {
    id: "actions",
    cell: () => (
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
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];



export default function CategoriesList() {
  const { data: categories, isLoading, error } = useFinanceCategories();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading categories</div>;

  return (
    <DataTable
      data={categories || []}
      columns={categoryColumns}
      schema={categorySchema}
      typeName="Categories"
    />
  );
}