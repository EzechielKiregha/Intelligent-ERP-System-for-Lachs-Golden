'use client'
import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { ChevronDownIcon, Star } from 'lucide-react'
import BasePopover from '@/components/BasePopover'
import { useSearchParams } from 'next/navigation'
import { useEmployees, useReviews, useSaveReview, useSingleEmployee } from '@/lib/hooks/hr'
import { toast } from 'sonner'
import { useAuth } from 'contents/authContext'

const schema = z.object({
  reviewDate: z.date(),
  rating: z.enum(['EXCEEDS', 'MEETS', 'NEEDS_IMPROVEMENT']),
  comments: z.string().min(1),
  reviewerId: z.string().optional(),
  employeeId: z.string().optional(),
})
type Form = z.infer<typeof schema>

export default function ReviewForm({ reviewId }: { reviewId?: string }) {
  const params = useSearchParams()
  const id = reviewId ?? params.get('id') ?? undefined
  const { data: r } = useReviews() // for single you’d use useSingleReview; here quick
  const save = useSaveReview()
  const { data: employees, isLoading } = useEmployees();
  const user = useAuth().user;
  const empId = params.get('employeeId') || ''

  const { data: e, isLoading: eLoasing } = useSingleEmployee(empId)

  const [date, setDate] = useState<Date | undefined>(r?.find(x => x.id === id)?.reviewDate ? new Date(r.find(x => x.id === id)!.reviewDate) : undefined)

  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      employeeId: empId || '',
      reviewerId: user?.id || '',
      reviewDate: date,
      rating: r?.find(x => x.id === id)?.rating,
      comments: r?.find(x => x.id === id)?.comments,
    } as any
  })

  useEffect(() => {
    if (id && r) {
      const existing = r.find(x => x.id === id)
      if (existing) {
        reset({ reviewDate: new Date(existing.reviewDate), rating: existing.rating, comments: existing.comments } as any)
        setDate(new Date(existing.reviewDate))
      }
    }
  }, [id, r, reset])

  const onSubmit = (data: Form) => {
    save.mutate({ id, ...data }, {
      onSuccess: () => {
        reset()
        toast.success('Review Saved')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 bg-sidebar text-sidebar-foreground rounded-lg max-w-sm">
      {eLoasing && !e ? "" : e && (
        <>
          <p>Employee Being Reviewed</p>
          <h1 className='font-medium text-2xl'>{e.firstName} {e.lastName} </h1>
        </>
      )}
      {

        !e && (

          <div className="space-y-2">
            <Label>
              Employee Being Reviewed

            </Label>
            <Controller name="employeeId" control={control} render={({ field }) =>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="p-0 w-full bg-sidebar">
                  {/* <SelectItem key={0} value="None"> None</SelectItem> */}
                  {isLoading || !employees ? (
                    <SelectItem value="Loading...">Loading / None</SelectItem>
                  ) : employees?.map(emp =>
                    <SelectItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            } />
          </div>

        )

      }
      <div className="space-y-2">
        <Label>Review Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {date ? date.toLocaleDateString() : 'Select date'}<ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-auto">
            <Calendar mode="single" selected={date} onSelect={d => setDate(d || undefined)} />
          </PopoverContent>
        </Popover>
        {errors.reviewDate && <p className="text-red-600 text-sm">{errors.reviewDate.message}</p>}
      </div>
      <div className="space-y-2">
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
      <div className="space-y-2">
        <Label>Comments</Label>
        <Textarea {...register('comments')} />
        {errors.comments && <p className="text-red-600 text-sm">{errors.comments.message}</p>}
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full bg-sidebar-accent hover:bg-sidebar-primary text-sidebar-accent-foreground">
        {id ? 'Update Review' : 'Create Review'}
      </Button>
    </form>
  )
}
