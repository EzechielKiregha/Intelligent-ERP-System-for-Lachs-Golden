'use client';

import InventorySummaryCards from "./_components/InventorySummaryCards";
import ProductsTable from "./_components/ProductTable";

export default function InventoryPage() {

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold text-sidebar-foreground">Inventory Dashboard</h1>
      <InventorySummaryCards />
      <ProductsTable />
    </div>
  );
}
