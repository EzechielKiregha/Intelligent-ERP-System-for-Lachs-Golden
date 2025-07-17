'use client'
import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { ChevronDownIcon, Star } from 'lucide-react'
import BasePopover from '@/components/BasePopover'
import { useEmployees, useReviews, useSaveReview } from '@/lib/hooks/hr'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from 'contents/authContext'
import { toast } from 'sonner'

const schema = z.object({
  reviewDate: z.date(),
  rating: z.enum(['EXCEEDS', 'MEETS', 'NEEDS_IMPROVEMENT']),
  comments: z.string().min(1),
  reviewerId: z.string().optional(),
  employeeId: z.string().optional(),
})
type Form = z.infer<typeof schema>

export default function ReviewFormPopover() {

  const save = useSaveReview()
  const [date, setDate] = useState<Date | undefined>()
  const { data: employees, isLoading } = useEmployees();
  const user = useAuth().user;

  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      reviewDate: new Date(),
      rating: 'MEETS',
      comments: '',
      reviewerId: user?.id || '',
      employeeId: ''
    }
  })

  const onSubmit = (data: Form) => {
    save.mutate({ ...data }, {
      onSuccess: () => reset(),
    })
  }

  return (
    <BasePopover title={'New Review'} buttonLabel={'Add Review'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 bg-sidebar text-sidebar-foreground rounded-lg max-w-sm">
        <div className="w-full space-y-2">
          <Label>Employee</Label>
          <Controller name="employeeId" control={control} render={({ field }) =>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="p-0 w-auto bg-sidebar">
                {/* <SelectItem key={0} value="None"> None</SelectItem> */}
                {isLoading || !employees ? (
                  <SelectItem value="Loading...">Loading / None</SelectItem>
                ) : employees?.map(emp =>
                  <>
                    <SelectItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          } />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 justify-between gap-6">
          <div className="w-full space-y-2">
            <Label>Review Date</Label>
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
            {errors.reviewDate && <p className="text-red-600 text-sm">{errors.reviewDate.message}</p>}
          </div>
          <div className="w-full space-y-2">
            <Label>Rating</Label>
            <Controller name="rating" control={control} render={({ field }) =>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className='w-full bg-sidebar border border-sidebar-border rounded-md p-2'>
                  {['EXCEEDS', 'MEETS', 'NEEDS_IMPROVEMENT'].map(s =>
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            } />
          </div>
        </div>
        <div className="w-full space-y-2">
          <Label>Comments</Label>
          <Textarea {...register('comments')} />
          {errors.comments && <p className="text-red-600 text-sm">{errors.comments.message}</p>}
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full bg-sidebar-accent hover:bg-sidebar-primary text-sidebar-accent-foreground">
          {'Create Review'}
        </Button>
      </form>
    </BasePopover>
  )
}
