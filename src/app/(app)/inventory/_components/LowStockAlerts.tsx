// components/inventory/LowStockAlerts.tsx
'use client'
import { useLowStockProducts } from '@/lib/hooks/inventory'
import ProductListTable, { productColumns } from './ProductListTable'

export default function LowStockAlerts() {
  const { data } = useLowStockProducts()
  return (
    <div>
      <h2 className="text-xl mb-4">Low Stock Alerts</h2>
      <ProductListTable />
    </div>
  )
}
