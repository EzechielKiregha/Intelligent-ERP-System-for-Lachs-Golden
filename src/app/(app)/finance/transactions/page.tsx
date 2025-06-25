"use client"
import { z } from "zod";
import { ColumnDef } from "@tanstack/react-table";
import { useFinanceTransactions } from "@/lib/hooks/finance";
import { DataTable, DragHandle, TableCellViewer } from "../../_components/ReusableDataTable";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IconCircleCheckFilled, IconDotsVertical, IconLoader } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

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
      <TableCellViewer item={{
        id: row.original.id,
        date: row.original.date,
        description: row.original.description,
        status: row.original.status,
        category: row.original.category.name,
        amount: row.original.amount,
        user: row.original.user?.name
      }}
        typeName="Transactions" />
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

  if (isLoading) return <Skeleton className={`p-4 m-4 h-90 w-full rounded-lg bg-sidebar`} />;
  if (error) return <div>Error loading transactions</div>;

  return (
    <div className="space-y-6 p-4">
      <Card className="bg-[var(--sidebar)] text-[var(--sidebar-foreground)] ">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Financial Overview & Transactions Visualization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Still in finance dashboard. Use view all transactions made so far category budgets and visualize your company’s financial allocation in real-time.
          </p>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-sm text-gray-800 dark:text-gray-300 max-w-2xl">
              Click on the <span className="text-sidebar-accent">description</span>. Track usage as it happens and export detailed reports to keep your team aligned click <Link className="text-sidebar-accent" href="/dashboard/reports">here</Link>.
            </p>
          </div>
        </CardContent>
      </Card>
      {/* Reports Section */}
      <div>
        {/* Transactions Report */}
        <DataTable
          data={transactions || []}
          columns={transactionColumns}
          schema={transactionSchema}
          typeName="Transactions"
        />
      </div>
    </div>

  );
}