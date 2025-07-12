'use client';

import InventorySummaryCards from "./_components/InventorySummaryCards";
import ProductsTable from "./_components/ProductTable";

export default function InventoryPage() {

  return (
    <div className="flex flex-col min-h-full">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <h1 className="text-2xl font-semibold text-sidebar-foreground">Inventory Dashboard</h1>
          <InventorySummaryCards />
          <ProductsTable />
        </div>
      </div>
    </div>
  );
}
