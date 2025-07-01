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
  const params = useSearchParams()
  const id = params.get('id') ?? undefined
  const { data: list } = useDepartments()
  const dept = list?.find((d) => d.id === id)
  const save = useSaveDepartment()
  const router = useRouter()
  const isEdit = Boolean(dept)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(depSchema),
    defaultValues: { name: dept?.name || '', description: dept?.description },
  })

  useEffect(() => {
    reset({ name: dept?.name || '' })
  }, [dept, reset])

  const onSubmit = async (data: Form) => {
    try {
      await save.mutateAsync({ id, name: data.name })
      toast.success(isEdit ? 'Department updated' : 'Department created')
      router.push('/hr/departments')
    } catch {
      toast.error('Save failed')
    }
  }

  return (
    <BasePopover
      title={isEdit ? 'Edit Department' : 'New Department'}
      buttonLabel={isEdit ? 'Edit Dept.' : 'Add Department'}
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
          {isEdit ? 'Update' : 'Create'}
        </Button>
      </form>
    </BasePopover>
  )
}
