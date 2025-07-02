'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import BasePopover from '@/components/BasePopover'
import { toast } from 'react-hot-toast'
import { useSearchParams, useRouter } from 'next/navigation'
import { useDepartments, useSaveDepartment } from '@/lib/hooks/hr'
import { Textarea } from '@/components/ui/textarea'

export const depSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional()
})
type Form = z.infer<typeof depSchema>

export default function DepartmentFormPopover() {
  const save = useSaveDepartment()
  const router = useRouter()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(depSchema),
  })

  const onSubmit = async (data: Form) => {
    try {
      await save.mutateAsync({ name: data.name, desc: data.description })
      toast.success('Department created')
      router.push('/hr/departments')
    } catch {
      toast.error('Save failed')
    }
  }

  return (
    <BasePopover
      title={'New Department'}
      buttonLabel={'Add Department'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 bg-sidebar text-sidebar-foreground rounded-lg max-w-sm">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register('name')} />
          {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register('description')} className="bg-sidebar" />
          {errors.description && <p className="text-red-600 text-sm">{errors.description.message}</p>}
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full cursor-pointer bg-sidebar-accent hover:bg-sidebar-primary text-sidebar-accent-foreground"
        >
          Create
        </Button>
      </form>
    </BasePopover>
  )
}
