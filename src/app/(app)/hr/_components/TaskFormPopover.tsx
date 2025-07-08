'use client'
import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem
} from '@/components/ui/select'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { ChevronDownIcon } from 'lucide-react'
import BasePopover from '@/components/BasePopover'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'
import { useEmployees, useSaveTask, useSingleTask } from '@/lib/hooks/hr'

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE']),
  dueDate: z.date().nullable(),
  assigneeId: z.string().optional(),
})
type Form = z.infer<typeof schema>

export default function TaskFormPopover() {

  const emps = useEmployees()
  const save = useSaveTask()
  const [date, setDate] = useState<Date | undefined>()

  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (d: Form) => {
    save.mutate({ ...d, dueDate: date || null }, { onSuccess: () => reset() })
  }

  return (
    <BasePopover title={'New Task'} buttonLabel={'Add Task'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 bg-sidebar text-sidebar-foreground rounded-lg max-w-sm">
        <div>
          <Label>Title</Label>
          <Input {...register('title')} />
          {errors.title && <p className="text-red-600 text-sm">{errors.title.message}</p>}
        </div>
        <div>
          <Label>Description</Label>
          <Input {...register('description')} />
        </div>
        <div>
          <Label>Status</Label>
          <Controller name="status" control={control} render={({ field }) =>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['PENDING', 'IN_PROGRESS', 'DONE'].map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          } />
        </div>
        <div>
          <Label>Assignee</Label>
          <Controller name="assigneeId" control={control} render={({ field }) =>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                {emps.data?.map(e => (
                  <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          } />
        </div>
        <div>
          <Label>Due Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {date ? date.toLocaleDateString() : 'Select date'}<ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-auto">
              <Calendar mode="single" selected={date} onSelect={(d) => setDate(d || undefined)} />
            </PopoverContent>
          </Popover>
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full bg-sidebar-accent hover:bg-sidebar-primary text-sidebar-accent-foreground">
          {'Create Task'}
        </Button>
      </form>
    </BasePopover>
  )
}
