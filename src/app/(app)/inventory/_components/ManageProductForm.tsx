'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Product, useSingleProduct } from '@/lib/hooks/inventory'
import { toast } from 'react-hot-toast'
import axiosdb from '@/lib/axios'

const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  unitPrice: z.number().min(0.01),
  quantity: z.number().min(0),
  threshold: z.number().min(0),
  description: z.string().optional(),
})
type ProductFormValues = z.infer<typeof productSchema>

interface Props {
  productId?: string | null | undefined
}

export default function ManageProductForm({ productId }: Props) {
  const router = useRouter()
  let product: Product | undefined;
  if (productId) {
    const { data } = useSingleProduct(productId)
    product = data
  }
  const isEdit = Boolean(productId && product)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name,
      sku: product?.sku,
      unitPrice: product?.unitPrice,
      quantity: product?.quantity,
      threshold: product?.threshold,
      description: product?.description,
    }
  })

  useEffect(() => {
    if (product) {
      reset(product)
    }
  }, [product, reset])

  const onSubmit = async (data: ProductFormValues) => {
    try {
      if (isEdit && productId) {
        await axiosdb.patch(`/api/inventory/products/${productId}?id=${productId}`, data)
        toast.success('Product updated')
      } else {
        await axiosdb.post('/api/inventory/products/create', data)
        toast.success('Product created')
      }
      router.push('/inventory/manage')
    } catch (err) {
      console.error(err)
      toast.error('Failed to save product')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto p-6 space-y-6 bg-sidebar text-sidebar-foreground rounded-xl">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Name</label>
          <Input {...register('name')} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block mb-1">SKU</label>
          <Input {...register('sku')} />
          {errors.sku && <p className="text-sm text-red-500">{errors.sku.message}</p>}
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="block mb-1">Unit Price</label>
          <Controller name="unitPrice" control={control} render={({ field }) => (
            <Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
          )} />
          {errors.unitPrice && <p className="text-sm text-red-500">{errors.unitPrice.message}</p>}
        </div>
        <div>
          <label className="block mb-1">Quantity</label>
          <Controller name="quantity" control={control} render={({ field }) => (
            <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
          )} />
          {errors.quantity && <p className="text-sm text-red-500">{errors.quantity.message}</p>}
        </div>
        <div>
          <label className="block mb-1">Threshold</label>
          <Controller name="threshold" control={control} render={({ field }) => (
            <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
          )} />
          {errors.threshold && <p className="text-sm text-red-500">{errors.threshold.message}</p>}
        </div>
      </div>
      <div>
        <label className="block mb-1">Description</label>
        <Textarea {...register('description')} />
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full bg-sidebar-accent hover:bg-sidebar-primary text-sidebar-accent-foreground">
        {isEdit ? 'Update Product' : 'Create Product'}
      </Button>
    </form>
  )
}