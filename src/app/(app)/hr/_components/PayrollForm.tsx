'use client'
import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { ChevronDownIcon } from 'lucide-react'
import BasePopover from '@/components/BasePopover'
import { toast } from 'sonner'
import { useEmployees, useSavePayroll, useSinglePayroll } from '@/lib/hooks/hr'
import { useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const payrollSchema = z.object({
  employeeId: z.string(),
  payPeriod: z.string().optional(),
  grossAmount: z.number().min(0),
  taxAmount: z.number().optional(),
  netAmount: z.number().optional(),
  issuedDate: z.date().nullable(),
  notes: z.string().optional(),
})
type Form = z.infer<typeof payrollSchema>

export default function PayrollForm({ payrollId }: { payrollId?: string }) {
  const params = useSearchParams()
  const id = payrollId ?? params.get('id') ?? undefined
  const { data: pr } = useSinglePayroll(id)
  const { data: employees, isLoading } = useEmployees();
  const save = useSavePayroll()
  const employeeId = useSearchParams().get('employeeId') || pr?.employeeId || ''

  const [date, setDate] = useState<Date | undefined>(
    pr?.issuedDate ? new Date(pr.issuedDate) : undefined
  )

  const isEdit = Boolean(pr)

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      ...pr,
      grossAmount: pr?.grossAmount ?? 0,
      taxAmount: pr?.taxAmount ?? 0,
      netAmount: pr?.netAmount ?? 0,
      issuedDate: pr?.issuedDate ? new Date(pr.issuedDate) : null,
    } as any,
  })

  useEffect(() => {
    if (pr) {
      reset({
        ...pr,
        issuedDate: pr.issuedDate ? new Date(pr.issuedDate) : null,
      } as any)
      setDate(pr.issuedDate ? new Date(pr.issuedDate) : undefined)
    }
  }, [pr, reset])

  const onSubmit = async (data: Form) => {
    try {
      await save.mutateAsync({ id, ...data, issuedDate: date ?? null })
      toast.success(isEdit ? 'Payroll updated' : 'Payroll created')
    } catch {
      toast.error('Save failed')
    }
  }

  return (

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 bg-sidebar text-sidebar-foreground rounded-lg max-w-md">
      <div>
        <Label>Employee Being Reviewed</Label>
        <Controller name="employeeId" control={control} render={({ field }) =>
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="p-0 w-auto bg-sidebar">
              {/* <SelectItem key={0} value="None"> None</SelectItem> */}
              {isLoading || !employees ? (
                <SelectItem value="Loading...">Loading / None</SelectItem>
              ) : employees?.map(emp => {
                if (emp.id === field.value) {
                  return (
                    <SelectItem key={emp.id} defaultChecked value={emp.id}>{emp.firstName} {emp.lastName}</SelectItem>
                  )
                }
                return (
                  <SelectItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</SelectItem>
                )
              }
              )}
            </SelectContent>
          </Select>
        } />
      </div>
      {errors.employeeId && <p className="text-red-600 text-sm">{errors.employeeId.message}</p>}

      <div>
        <Label>Gross Amount</Label>
        <Input type="number" step="0.01" {...register('grossAmount', { valueAsNumber: true })} />
      </div>
      <div>
        <Label>Tax Amount</Label>
        <Input type="number" step="0.01" {...register('taxAmount', { valueAsNumber: true })} />
      </div>
      <div>
        <Label>Net Amount</Label>
        <Input type="number" step="0.01" {...register('netAmount', { valueAsNumber: true })} />
      </div>

      <div>
        <Label>Issued Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {date ? date.toLocaleDateString() : 'Select date'}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={date} onSelect={(d) => setDate(d || undefined)} />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label>Notes</Label>
        <Textarea {...register('notes')} />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-sidebar-accent hover:bg-sidebar-primary text-sidebar-accent-foreground"
      >
        {isEdit ? 'Update Payroll' : 'Create Payroll'}
      </Button>
    </form>
  )
}
