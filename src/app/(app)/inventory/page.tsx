'use client';

import { getGreeting } from "@/lib/utils";
import InventorySummaryCards from "./_components/InventorySummaryCards";
import ProductsTable from "./_components/ProductTable";
import { useAuth } from "contents/authContext";
import { useGetCompanyById } from "@/lib/hooks/use-owner-company";

export default function InventoryPage() {

  const currentUser = useAuth().user;
  const { data: company, isLoading: companyLoading, isError: companyError } = useGetCompanyById(currentUser?.currentCompanyId || '');


  return (
    <div className="flex flex-col min-h-full">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div>
            <h2 className="text-2xl font-semibold">
              {getGreeting()} {currentUser.name}
            </h2>
            <h3 className="text-lg text-muted-foreground">
              Welcome to &quot;{company?.name || 'Your Company'}&quot; Inventory Dashboard
            </h3>
          </div>
          <InventorySummaryCards />
          <ProductsTable />
        </div>
      </div>
    </div>
  );
}
