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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { truncateText } from "@/lib/utils";
import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "contents/authContext";
import { Role } from "@/generated/prisma";
import { toast } from "sonner";
import { Edit2 } from "lucide-react";

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
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const description = row.original.description || '';
      const [isDescriptionModalOpen, setIsDescriptionModalOpen] = React.useState(false); // State for this specific modal

      const truncated = truncateText(description, 10); // Adjust maxLength as needed

      return (
        <>
          <TableCellViewer item={{
            id: row.original.id,
            date: row.original.date,
            description: truncated,
            status: row.original.status,
            category: row.original.category.name,
            amount: row.original.amount,
            user: row.original.user?.name
          }}
            typeName="Transactions" />
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
          </Dialog>
        </>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge
          variant="outline"
          className={`px-1.5 border-[var(--sidebar-border)] text-[var(--sidebar-foreground)] ${row.original.category.type === "INCOME"
            ? "bg-[var(--sidebar-primary)] dark:bg-[var(--sidebar-primary)]"
            : "bg-red-500 dark:bg-red-700"
            }`}
        >
          {row.original.category.name} ({row.original.category.type})
        </Badge>
      </div>
    ),
  },
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
  {
    id: 'actions', cell: ({ row }) => {
      const router = useRouter()
      const user = useAuth().user
      const hasAccess = user?.role === Role.ADMIN || user?.role === Role.SUPER_ADMIN || user?.role === Role.ACCOUNTANT || user?.role === Role.MANAGER
      return <div className="flex gap-2">
        <Button variant="ghost" size="icon" onClick={() => {
          if (hasAccess) {
            toast.warning("You do not have permission to edit this Transaction.");
            // router.push(`/inventory/products/manage?id=${row.original.id}`);
          } else {
            toast.warning("You do not have permission to edit this Transaction.");
          }
        }}><Edit2 /></Button>
      </div>
    }
  }
];

export default function TransactionsPage() {
  const { data: transactions, isLoading, error } = useFinanceTransactions();

  if (isLoading) return <Skeleton className={`h-90 w-full rounded-lg bg-sidebar`} />;
  if (error) {
    return (
      <div className="bg-sidebar text-sidebar-foreground p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold">No Transactions Found</h3>
        <p className="text-sm">
          Start managing your company&apos;s finances transactions by adding a quick transactions.
        </p>
        {/* <div className="mt-4 space-y-2 flex flex-row justify-between items-start">
          <Link href="/finance/trasactions" className="text-sm text-[#A17E25] hover:underline dark:text-[#D4AF37]">
            Create Categories
          </Link>
        </div> */}
      </div>
    );
  };

  return (
    <div className="space-y-6">
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