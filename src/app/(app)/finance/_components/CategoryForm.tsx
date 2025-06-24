'use client'
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import axiosfb from 'axios'
import { toast } from 'react-hot-toast'

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['INCOME', 'EXPENSE']),
  budgetLimit: z.number().min(0, 'Must be non-negative'),
})
type CategoryFormValues = z.infer<typeof categorySchema>

export default function CategoryForm({ existing }: { existing?: CategoryFormValues & { id: string } }) {
  const router = useRouter()
  const isEdit = Boolean(existing)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: existing ? { name: existing.name, type: existing.type, budgetLimit: existing.budgetLimit } : undefined,
  })

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      if (isEdit && existing) {
        await axiosfb.put(`/api/finance/categories/${existing.id}`, data)
        toast.success('Category updated')
      } else {
        await axiosfb.post('/api/finance/categories', data)
        toast.success('Category created')
      }
      router.refresh() // refresh list
    } catch (err) {
      console.error(err)
      toast.error('Failed to save category')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-sidebar p-14 rounded-2xl border">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-red-600">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select {...register('type')}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INCOME">Income</SelectItem>
            <SelectItem value="EXPENSE">Expense</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && <p className="text-red-600">{errors.type.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="budgetLimit">Budget Limit</Label>
        <Input
          id="budgetLimit"
          type="number"
          step="0.01"
          {...register('budgetLimit', { valueAsNumber: true })}
        />
        {errors.budgetLimit && <p className="text-red-600">{errors.budgetLimit.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting}>{isEdit ? 'Update' : 'Create'}</Button>
    </form>
  )
}
