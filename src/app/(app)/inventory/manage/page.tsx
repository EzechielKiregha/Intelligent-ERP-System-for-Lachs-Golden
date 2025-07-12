"use client"

import { useSearchParams } from 'next/navigation'
import ManageProductForm from '../_components/ManageProductForm'
import ProductListTable from '../_components/ProductListTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ManagePage() {
  const params = useSearchParams()
  const id = params.get('id')
  return (

    <div className="flex flex-col min-h-full">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header Card */}
          <Card className="bg-[var(--sidebar)] text-[var(--sidebar-foreground)] border border-sidebar-border">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Product Stock Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Welcome to your Product Stock Management Dashboard. Use this page to visualize your company’s stock and threshold alert in real-time.
              </p>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <p className="text-sm text-gray-800 dark:text-gray-300 max-w-2xl">
                  Create, Update and Delete Products with few steps.
                </p>
              </div>
              <div className="p-6 space-y-6">
                <ManageProductForm productId={id} />
              </div>
            </CardContent>
          </Card>
          {/* Product List */}
          <ProductListTable />
        </div>
      </div>
    </div>
  )
}
