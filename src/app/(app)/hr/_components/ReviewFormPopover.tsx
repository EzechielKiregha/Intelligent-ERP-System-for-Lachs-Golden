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
import { useSearchParams } from 'next/navigation'
import { useReviews, useSaveReview } from '@/lib/hooks/hr'

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

  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: Form) => {
    save.mutate({ ...data }, { onSuccess: () => reset() })
  }

  return (
    <BasePopover title={'New Review'} buttonLabel={'Add Review'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 bg-sidebar text-sidebar-foreground rounded-lg max-w-sm">
        <div>
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
        <div>
          <Label>Rating</Label>
          <Controller name="rating" control={control} render={({ field }) =>
            <select {...field} className="w-full bg-sidebar border border-sidebar-border rounded-md p-2">
              {['EXCEEDS', 'MEETS', 'NEEDS_IMPROVEMENT'].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          } />
        </div>
        <div>
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
