'use client'

import { useState, useEffect, SetStateAction } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import BasePopover from '@/components/BasePopover'
import axios from 'axios'
import axiosdb from '@/lib/axios'
import { toast } from 'react-hot-toast'

// 1. Zod schema
const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  unitPrice: z.number().min(0.01, 'Price must be positive'),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
  threshold: z.number().min(0, 'Threshold cannot be negative'),
  description: z.string().optional(),
})
type ProductFormValues = z.infer<typeof productSchema>

// 2. Props: optionally pass an existing product to edit
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
  const isEdit = Boolean(product)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: isEdit
      ? {
        name: product!.name,
        sku: product!.sku,
        unitPrice: product!.unitPrice,
        quantity: product!.quantity,
        threshold: product!.threshold,
        description: product!.description,
      }
      : {}
  })

  // reset form when product prop changes
  useEffect(() => {
    if (isEdit) {
      reset({
        name: product!.name,
        sku: product!.sku,
        unitPrice: product!.unitPrice,
        quantity: product!.quantity,
        threshold: product!.threshold,
        description: product!.description,
      })
    } else {
      reset({})
    }
  }, [product, isEdit, reset])

  const onSubmit = async (data: ProductFormValues) => {
    try {
      if (isEdit) {
        await axiosdb.put('/api/inventory/update', { id: product!.id, ...data })
        toast.success('Product updated!')
      } else {
        await axiosdb.post('/api/inventory/create', data)
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
      title={isEdit ? 'Edit Product' : 'Add Product'}
      buttonLabel={isEdit ? 'Edit' : 'Add Product'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="w-full bg-sidebar text-sidebar-foreground max-w-lg space-y-6 p-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register('name')} />
          {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" {...register('sku')} />
          {errors.sku && <p className="text-red-600 text-sm">{errors.sku.message}</p>}
        </div>

        <div>
          <Label htmlFor="unitPrice">Unit Price (USD)</Label>
          <Controller
            name="unitPrice"
            control={control}
            render={({ field }) => (
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
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
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
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
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
              />
            )}
          />
          {errors.threshold && <p className="text-red-600 text-sm">{errors.threshold.message}</p>}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register('description')} />
          {errors.description && <p className="text-red-600 text-sm">{errors.description.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-primary"
        >
          {isEdit ? 'Update Product' : 'Create Product'}
        </Button>
      </form>
    </BasePopover>
  )
}
