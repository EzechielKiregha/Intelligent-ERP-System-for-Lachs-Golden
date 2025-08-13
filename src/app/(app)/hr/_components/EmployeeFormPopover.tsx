'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import BasePopover from '@/components/BasePopover'
import { toast } from 'sonner'
import { useDepartments, useSaveEmployee, useSingleEmployee } from '@/lib/hooks/hr'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChevronDownIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { useRouter } from 'next/navigation'

const empSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  hireDate: z.coerce.date().optional(),
  jobTitle: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
  departmentId: z.string().optional(),
})

type EmpForm = z.infer<typeof empSchema>

export default function EmployeeFormPopover() {
  const deps = useDepartments()
  const save = useSaveEmployee()
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>()

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<EmpForm>({
    resolver: zodResolver(empSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      hireDate: date,
      jobTitle: '',
      status: 'ACTIVE',
      departmentId: ''
    }
  })


  const onSubmit = (data: EmpForm) => {
    save.mutate({ ...data, date },
      {
        onSuccess: () => {
          toast.success('Employee Saved');
          reset()
          router.refresh()
        }
      })
  }

  return (
    <BasePopover title={'New Employee'} buttonLabel={'Add Employee'}>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md space-y-4 p-4 bg-sidebar text-sidebar-foreground rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div>
          <Label>Email</Label>
          <Input {...register('email')} type="email" />
          {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
        </div>
        <div>
          <Label>Phone</Label>
          <Input {...register('phone')} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <Label>Hire Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {date ? date.toLocaleDateString() : 'Select date'}<ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-auto bg-sidebar">
                <Calendar mode="single" selected={date} onSelect={d => setDate(d || undefined)} />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>Job Title</Label>
            <Input {...register('jobTitle')} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Status</Label>
            <Controller name="status" control={control} render={({ field }) =>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['ACTIVE', 'INACTIVE', 'SUSPENDED'].map(s =>
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            } />
          </div>
          <div>
            <Label>Department</Label>
            <Controller name="departmentId" control={control} render={({ field }) =>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  {deps.data?.map(d =>
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            } />
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full bg-sidebar-accent hover:bg-sidebar-primary text-sidebar-accent-foreground">
          {isSubmitting ? 'Recording... new employee' : 'Record a new employee'}
        </Button>
      </form>
    </BasePopover>
  )
}
