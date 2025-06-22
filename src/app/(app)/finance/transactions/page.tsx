"use client"
import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { useFinanceTransactions } from "@/lib/hooks/finance";
import { DataTable, DragHandle, TableCellViewer } from "../_components/ReusableDataTable";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IconCircleCheckFilled, IconDotsVertical, IconLoader } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

// Transaction schema
const transactionSchema = z.object({
  id: z.string(),
  date: z.string(),
  description: z.string().nullable(),
  category: z.object({
    name: z.string(),
    type: z.enum(["INCOME", "EXPENSE"]),
  }),
  amount: z.number(),
  status: z.string(),
  user: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
    })
    .optional(),
});

// Transaction columns
const transactionColumns: ColumnDef<z.infer<typeof transactionSchema>>[] = [
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
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <TableCellViewer item={row.original} typeName="Transactions" />
    ),
    enableHiding: false,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge
          variant="outline"
          className={`text-muted-foreground px-1.5 ${row.original.category.type === "INCOME"
            ? "bg-green-100 dark:bg-green-900"
            : "bg-red-100 dark:bg-red-900"
            }`}
        >
          {row.original.category.name} ({row.original.category.type})
        </Badge>
      </div>
    ),
  },
  // {
  //   accessorKey: "status",
  //   header: "Status",
  //   cell: ({ row }) => (
  //     <Badge
  //       variant="outline"
  //       className="px-1.5 border-[var(--sidebar-border)] text-[var(--sidebar-foreground)]"
  //     >
  //       {row.original.status === "Done" ? (
  //         <IconCircleCheckFilled className="fill-[var(--sidebar-primary)] dark:fill-[var(--sidebar-primary)]" />
  //       ) : (
  //         <IconLoader className="text-[var(--sidebar-foreground)]" />
  //       )}
  //       {row.original.status}
  //     </Badge>
  //   ),
  // },
  {
    accessorKey: "amount",
    header: () => <div className="w-full text-right">Amount</div>,
    cell: ({ row }) => (
      <div className="text-right font-mono">
        {row.original.category.type === "INCOME" ? "+" : "-"}
        ${Math.abs(row.original.amount).toFixed(2)}
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <div>{new Date(row.original.date).toLocaleDateString()}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground px-1.5">
        {row.original.status === "COMPLETED" || row.original.status === "REFUNDED" ? (
          <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />
        ) : (
          <IconLoader />
        )}
        {row.original.status}
      </Badge>
    ),
  },
  // {
  //   accessorKey: "user",
  //   header: "User",
  //   cell: ({ row }) => (
  //     <div>{row.original.user?.name ?? "No user assigned"}</div>
  //   ),
  // },
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

export default function TransactionsPage() {
  const { data: transactions, isLoading, error } = useFinanceTransactions();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading transactions</div>;

  return (
    <DataTable
      data={transactions || []}
      columns={transactionColumns}
      schema={transactionSchema}
      typeName="Transactions"
    />
  );
}