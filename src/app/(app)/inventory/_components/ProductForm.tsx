'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import BasePopover from '@/components/BasePopover'
import axiosdb from '@/lib/axios'
import { toast } from 'react-hot-toast'

// Zod schema
const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  unitPrice: z.number().min(0.01, 'Price must be positive'),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
  threshold: z.number().min(0, 'Threshold cannot be negative'),
  description: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormPopoverProps {
  product?: {
    id: string
    name: string
    sku: string
    unitPrice: number
    quantity: number
    threshold: number
    description?: string
  }
}

export default function ProductFormPopover({ product }: ProductFormPopoverProps) {
  const isEdit = !!product

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product || {
      name: '',
      sku: '',
      unitPrice: 0,
      quantity: 0,
      threshold: 0,
      description: '',
    }
  })

  useEffect(() => {
    if (product) {
      reset(product)
    } else {
      reset()
    }
  }, [product, reset])

  const onSubmit = async (data: ProductFormValues) => {
    try {
      if (isEdit) {
        await axiosdb.put('/api/inventory/products/update', { id: product!.id, ...data })
        toast.success('Product updated!')
      } else {
        await axiosdb.post('/api/inventory/products/create', data)
        toast.success('Product created!')
      }
      reset()
    } catch (err) {
      console.error(err)
      toast.error('Failed to save product')
    }
  }

  return (
    <BasePopover
      title={isEdit ? 'Edit Product' : 'New Product'}
      buttonLabel={isEdit ? 'Edit' : 'Product'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-3xl space-y-6 text-sidebar-foreground bg-sidebar p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} className="bg-sidebar" />
            {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" {...register('sku')} className="bg-sidebar" />
            {errors.sku && <p className="text-red-600 text-sm">{errors.sku.message}</p>}
          </div>

          <div>
            <Label htmlFor="unitPrice">Unit Price</Label>
            <Controller
              name="unitPrice"
              control={control}
              render={({ field }) => (
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  className="bg-sidebar"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              )}
            />
            {errors.unitPrice && <p className="text-red-600 text-sm">{errors.unitPrice.message}</p>}
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Controller
              name="quantity"
              control={control}
              render={({ field }) => (
                <Input
                  id="quantity"
                  type="number"
                  className="bg-sidebar"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              )}
            />
            {errors.quantity && <p className="text-red-600 text-sm">{errors.quantity.message}</p>}
          </div>

          <div>
            <Label htmlFor="threshold">Threshold</Label>
            <Controller
              name="threshold"
              control={control}
              render={({ field }) => (
                <Input
                  id="threshold"
                  type="number"
                  className="bg-sidebar"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              )}
            />
            {errors.threshold && <p className="text-red-600 text-sm">{errors.threshold.message}</p>}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} className="bg-sidebar" />
            {errors.description && <p className="text-red-600 text-sm">{errors.description.message}</p>}
          </div>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-sidebar-accent hover:bg-sidebar-primary text-sidebar-accent-foreground"
          >
            {isEdit ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </BasePopover>
  )
}
