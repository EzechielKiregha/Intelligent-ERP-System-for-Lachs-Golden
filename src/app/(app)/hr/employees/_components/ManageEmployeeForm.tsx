// app/hr/employees/_components/ManageEmployeeForm.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { ChevronDownIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useSearchParams, useRouter } from 'next/navigation'
import { useDepartments, useSaveEmployee, useSingleEmployee } from '@/lib/hooks/hr'

export const empSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  hireDate: z.date().nullable(),
  jobTitle: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'TERMINATED']),
  departmentId: z.string().nullable(),
})
type Form = z.infer<typeof empSchema>

export default function ManageEmployeeForm({ employeeId }: { employeeId?: string }) {
  const params = useSearchParams()
  const id = employeeId ?? params.get('id') ?? undefined
  const { data: emp } = useSingleEmployee(id)
  const deps = useDepartments()
  const save = useSaveEmployee()
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(emp?.hireDate ? new Date(emp.hireDate) : undefined)

  const isEdit = Boolean(emp)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(empSchema),
    defaultValues: {
      ...emp,
      hireDate: emp?.hireDate ? new Date(emp.hireDate) : null,
      departmentId: emp?.departmentId ?? null,
    } as any,
  })

  useEffect(() => {
    if (emp) {
      reset({
        ...emp,
        hireDate: emp.hireDate ? new Date(emp.hireDate) : null,
        departmentId: emp.departmentId ?? null,
      } as any)
      setDate(emp.hireDate ? new Date(emp.hireDate) : undefined)
    }
  }, [emp, reset])

  const onSubmit = async (data: Form) => {
    try {
      // ensure hireDate sync
      const payload = { ...data, hireDate: date ?? null }
      await save.mutateAsync({ id, ...payload })
      toast.success(isEdit ? 'Employee updated' : 'Employee created')
      router.push('/hr/employees')
    } catch {
      toast.error('Save failed')
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl mx-auto p-6 bg-sidebar text-sidebar-foreground rounded-lg space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First & Last */}
        <div>
          <Label>First Name</Label>
          <Input {...register('firstName')} />
          {errors.firstName && <p className="text-red-600 text-sm">{errors.firstName.message}</p>}
        </div>
        <div>
          <Label>Last Name</Label>
          <Input {...register('lastName')} />
          {errors.lastName && <p className="text-red-600 text-sm">{errors.lastName.message}</p>}
        </div>
      </div>

      {/* Email & Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Email</Label>
          <Input type="email" {...register('email')} />
          {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
        </div>
        <div>
          <Label>Phone</Label>
          <Input {...register('phone')} />
        </div>
      </div>

      {/* Hire Date & Job Title */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <Label>Hire Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {date ? date.toLocaleDateString() : 'Select date'}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  setDate(d || undefined)
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label>Job Title</Label>
          <Input {...register('jobTitle')} />
        </div>
      </div>

      {/* Status & Department */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['ACTIVE', 'INACTIVE', 'TERMINATED'].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <Label>Department</Label>
          <Controller
            name="departmentId"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {deps.data?.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || !deps.data}
        className="w-full bg-sidebar-accent cursor-pointer hover:bg-sidebar-primary text-sidebar-accent-foreground"
      >
        {isEdit ? 'Update Employee' : 'Create Employee'}
      </Button>
    </form>
  )
}
