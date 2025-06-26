
"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
  IconTrendingUp,
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "react-hot-toast"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import NewTransactionPopover from "../finance/_components/TransactioForm"
import { useNavigation } from "@/hooks/use-navigation"
import ProductFormPopover from "../inventory/_components/ProductForm"

// Generic interface for data with required id
interface DataWithId {
  id: string;
  [key: string]: any;
}

// Generic DataTable props
interface DataTableProps<TData extends DataWithId> {
  data: TData[];
  columns: ColumnDef<TData>[];
  schema: z.ZodSchema<TData>;
  typeName: string; // e.g., "Transactions" or "Categories"
}

// Drag handle component
export function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({ id });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-[var(--sidebar-foreground)] size-7 hover:bg-[var(--sidebar-accent)]"
    >
      <IconGripVertical className="text-[var(--sidebar-foreground)] size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

// Generic DraggableRow component
function DraggableRow<TData extends DataWithId>({ row }: { row: Row<TData> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id} className="text-[var(--sidebar-foreground)]">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

// Sample chart data (to be customized per data type)
const chartData = [
  { month: "January", value1: 1500, value2: 800 },
  { month: "February", value1: 2000, value2: 1200 },
  { month: "March", value1: 1800, value2: 900 },
  { month: "April", value1: 2200, value2: 1100 },
  { month: "May", value1: 1900, value2: 1000 },
  { month: "June", value1: 2100, value2: 950 },
];

// Generic DataTable component
export function DataTable<TData extends DataWithId>({
  data: initialData,
  columns,
  schema,
  typeName,
}: DataTableProps<TData>) {
  const [data, setData] = React.useState(() => initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  const nav = useNavigation()

  return (
    <Tabs
      defaultValue="main"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="main">
          <SelectTrigger
            className="flex w-fit border-[var(--sidebar-border)] text-[var(--sidebar-foreground)] focus:ring-[var(--sidebar-ring)]"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>
          <SelectContent className="border-[var(--sidebar-border)]">
            <SelectItem value="main">{typeName}</SelectItem>
            <SelectItem value="summary">Summary</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="hidden @4xl/main:flex bg-[var(--sidebar)] text-[var(--sidebar-foreground)]">
          <TabsTrigger value="main">{typeName}</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-[var(--sidebar-border)] text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] focus:ring-[var(--sidebar-ring)]"
              >
                <IconLayoutColumns />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-[var(--sidebar-border)]">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize text-[var(--sidebar-foreground)]"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={() => typeName === "Categories" && setIsModalOpen(true)}
            variant="outline"
            size="sm"
            className="border-[var(--sidebar-border)] bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] hover:bg-[var(--sidebar-primary)] focus:ring-[var(--sidebar-ring)]"
          >
            <IconPlus />
            {typeName === "Categories" && (
              <span className="hidden lg:inline">Add {typeName.slice(0, -1)}</span>
            )}
            {typeName === "Products" && (
              <ProductFormPopover />
            )}
            {typeName === "Transactions" && (
              <NewTransactionPopover />
            )}
          </Button>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen} >
            <DialogContent className="sm:max-w-md bg-sidebar text-sidebar-foreground">
              <DialogHeader>
                <DialogTitle>Redirect to budget section</DialogTitle>
                <DialogDescription>
                  Want allocate a new budget?
                  Please proceed to the budget page and follow instructions
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  onClick={() => {
                    nav(`/finance/budget`)
                    setIsModalOpen(false);
                  }}
                  className="bg-sidebar-accent hover:bg-sidebar-primary text-sidebar-accent-foreground"
                >
                  continue
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

        </div>
      </div>
      <TabsContent
        value="main"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border-[var(--sidebar-border)]">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-[var(--sidebar)] text-[var(--sidebar-foreground)] sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-[var(--sidebar-foreground)]"
                    >
                      No {typeName.toLowerCase()} found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-[var(--sidebar-foreground)] hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium text-[var(--sidebar-foreground)]">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger
                  size="sm"
                  className="w-20 border-[var(--sidebar-border)] text-[var(--sidebar-foreground)] focus:ring-[var(--sidebar-ring)]"
                  id="rows-per-page"
                >
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top" className="border-[var(--sidebar-border)]">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium text-[var(--sidebar-foreground)]">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex border-[var(--sidebar-border)] text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] focus:ring-[var(--sidebar-ring)]"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8 border-[var(--sidebar-border)] text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] focus:ring-[var(--sidebar-ring)]"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8 border-[var(--sidebar-border)] text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] focus:ring-[var(--sidebar-ring)]"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex border-[var(--sidebar-border)] text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] focus:ring-[var(--sidebar-ring)]"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="summary"
        className="flex flex-col px-4 lg:px-6"
      >
        <div className="aspect-video w-full flex-1 rounded-lg border-[var(--sidebar-border)]">
          <p className="text-center text-[var(--sidebar-foreground)] pt-20">
            {typeName} summary view resizing soon...
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
}

// Generic TableCellViewer
export function TableCellViewer<TData extends DataWithId>({ item, typeName }: { item: TData; typeName: string }) {
  const isMobile = useIsMobile();

  // Dynamic chart config based on typeName
  const chartConfig = React.useMemo<ChartConfig>(() => {
    if (typeName === "Categories") {
      return {
        budgetLimit: {
          label: "Budget Limit",
          color: "hsl(var(--sidebar-accent))",
        },
        budgetUsed: {
          label: "Budget Used",
          color: "hsl(var(--sidebar-ring))",
        },
        value1: {
          label: undefined,
          color: undefined,
        },
        value2: {
          label: undefined,
          color: undefined,
        },
      };
    } else if (typeName === "Products") {
      return {
        budgetLimit: {
          label: "Quantity",
          color: "hsl(var(--sidebar-accent))",
        },
        budgetUsed: {
          label: "Threshold",
          color: "hsl(var(--sidebar-ring))",
        },
        value1: {
          label: undefined,
          color: undefined,
        },
        value2: {
          label: undefined,
          color: undefined,
        },
      };
    }
    return {
      value1: {
        label: "Value 1",
        color: "hsl(var(--chart-1))",
      },
      value2: {
        label: "Value 2",
        color: "hsl(var(--chart-2))",
      },
      budgetLimit: {
        label: undefined,
        color: undefined,
      },
      budgetUsed: {
        label: undefined,
        color: undefined,
      },
    };
  }, [typeName]);

  // Dynamic title and description
  const title = typeName === "Categories" ? (item as any).category : (item as any).description ?? typeName === "Products" ? (item as any).category : `Unnamed ${typeName.slice(0, -1)}`;
  const description = `Details for ${typeName.toLowerCase()}`;

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-[var(--sidebar-foreground)] w-fit px-0 text-left hover:text-[var(--sidebar-accent)]">
          {title}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="border-[var(--sidebar-border)] bg-sidebar text-sidebarforeground">
        <DrawerHeader className="gap-1">
          <DrawerTitle className="text-[var(--sidebar-foreground)]">{title}</DrawerTitle>
          <DrawerDescription className="text-[var(--sidebar-foreground)]">{description}</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 0,
                    right: 10,
                  }}
                >
                  <CartesianGrid vertical={false} stroke="var(--sidebar-border)" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey={typeName === "Categories" ? "budgetUsed" : "value2"}
                    type="natural"
                    fill={chartConfig[typeName === "Categories" ? "budgetUsed" : "value2"].color}
                    fillOpacity={0.6}
                    stroke={chartConfig[typeName === "Categories" ? "budgetUsed" : "value2"].color}
                    stackId="a"
                  />
                  <Area
                    dataKey={typeName === "Categories" ? "budgetLimit" : "value1"}
                    type="natural"
                    fill={chartConfig[typeName === "Categories" ? "budgetLimit" : "value1"].color}
                    fillOpacity={0.4}
                    stroke={chartConfig[typeName === "Categories" ? "budgetLimit" : "value1"].color}
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
              <Separator className="bg-[var(--sidebar-border)]" />
              <div className="grid gap-2">
                <div className="flex gap-2 leading-none font-medium text-[var(--sidebar-foreground)]">
                  {typeName} Details <IconTrendingUp className="size-4" />
                </div>
                <div className="text-[var(--sidebar-foreground)]">
                  Showing key metrics for this {typeName.toLowerCase()}.
                </div>
              </div>
              <Separator className="bg-[var(--sidebar-border)]" />
            </>
          )}
          <form className="flex flex-col gap-4">
            {Object.entries(item).map(([key, value]) => (
              <div key={key} className="flex flex-col gap-3">
                <Label htmlFor={key} className="capitalize text-[var(--sidebar-foreground)]">
                  {key}
                </Label>
                {typeof value === "string" || typeof value === "number" ? (
                  <Input
                    id={key}
                    defaultValue={value}
                    disabled
                    type={typeof value === "number" ? "number" : "text"}
                    className="border-[var(--sidebar-border)] text-[var(--sidebar-foreground)] focus:ring-[var(--sidebar-ring)]"
                  />
                ) : typeof value === "object" && value !== null ? (
                  <Input
                    id={key}
                    defaultValue={JSON.stringify(value)}
                    disabled
                    className="border-[var(--sidebar-border)] text-[var(--sidebar-foreground)]"
                  />
                ) : (
                  <Input
                    id={key}
                    defaultValue=""
                    placeholder="No value"
                    className="border-[var(--sidebar-border)] text-[var(--sidebar-foreground)]"
                  />
                )}
              </div>
            ))}
          </form>
        </div>
        <DrawerFooter>
          {/* <Button
            className="bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] hover:bg-[var(--sidebar-accent)] focus:ring-[var(--sidebar-ring)]"
          >
            Submit
          </Button> */}
          <DrawerClose asChild>
            <Button
              variant="outline"
              className="border-[var(--sidebar-border)] text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] focus:ring-[var(--sidebar-ring)]"
            >
              Done
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}