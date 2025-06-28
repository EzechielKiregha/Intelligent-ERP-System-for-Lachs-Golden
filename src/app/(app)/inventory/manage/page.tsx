import { useSearchParams } from 'next/navigation'
import ManageProductForm from '../_components/ManageProductForm'
import ProductListTable from '../_components/ProductListTable'

export default function ManagePage() {
  const params = useSearchParams()
  const id = params.get('id')
  return (
    <div className="p-6 space-y-6">
      <ManageProductForm productId={id} />
      <ProductListTable />
    </div>
  )
}
