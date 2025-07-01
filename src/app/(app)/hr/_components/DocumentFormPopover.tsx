'use client'
import React, { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import BasePopover from '@/components/BasePopover'
import { toast } from 'react-hot-toast'
import { useSearchParams } from 'next/navigation'
import { useSaveDocument, useSingleDocument } from '@/lib/hooks/hr'

const schema = z.object({
  title: z.string().min(1),
  fileUrl: z.string().url(),
  description: z.string().optional(),
  ownerId: z.string().optional(),
})

type Form = z.infer<typeof schema>

export default function DocumentFormPopover({ documentId }: { documentId?: string }) {
  const params = useSearchParams()
  const id = documentId ?? params.get('id') ?? undefined
  const { data: doc } = useSingleDocument(id)
  const save = useSaveDocument()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: doc || {}
  })

  useEffect(() => { reset(doc || {}) }, [doc, reset])

  const onSubmit = (d: Form) => {
    save.mutate({ id, ...d }, { onSuccess: () => reset() })
  }

  return (
    <BasePopover title={id ? 'Edit Document' : 'New Document'} buttonLabel={id ? 'Edit Doc' : 'Add Document'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 bg-sidebar text-sidebar-foreground rounded-lg max-w-sm">
        <div>
          <Label>Title</Label>
          <Input {...register('title')} />
          {errors.title && <p className="text-red-600 text-sm">{errors.title.message}</p>}
        </div>
        <div>
          <Label>File URL</Label>
          <Input {...register('fileUrl')} />
          {errors.fileUrl && <p className="text-red-600 text-sm">{errors.fileUrl.message}</p>}
        </div>
        <div>
          <Label>Description</Label>
          <Textarea {...register('description')} />
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full bg-sidebar-accent hover:bg-sidebar-primary text-sidebar-accent-foreground">
          {id ? 'Update' : 'Create'}
        </Button>
      </form>
    </BasePopover>
  )
}
