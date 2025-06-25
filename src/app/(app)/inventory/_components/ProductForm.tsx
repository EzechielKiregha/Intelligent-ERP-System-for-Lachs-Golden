'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import BasePopover from '@/components/BasePopover';
import toast from 'react-hot-toast';
import { useCreateProduct, useUpdateProduct } from '@/lib/hooks/inventory';

const schema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  quantity: z.coerce.number().min(0),
  threshold: z.coerce.number().min(0),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function ProductForm({ product }: { product?: any }) {
  const isEdit = !!product;
  const create = useCreateProduct();
  const update = useUpdateProduct();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: isEdit
      ? {
        name: product.name,
        sku: product.sku,
        quantity: product.quantity,
        threshold: product.threshold,
        description: product.description,
      }
      : {},
  });

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEdit) {
        await update.mutateAsync({ ...data, id: product.id });
        toast.success('Product updated!');
      } else {
        await create.mutateAsync(data);
        toast.success('Product created!');
      }
      form.reset();
    } catch (e) {
      toast.error('Failed to save product.');
    }
  };

  return (
    <BasePopover title={isEdit ? 'Edit Product' : 'Add Product'} buttonLabel={isEdit ? 'Edit' : 'Add Product'}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4 px-2 md:px-8">
        <div>
          <Label>Name</Label>
          <Input {...form.register('name')} />
        </div>
        <div>
          <Label>SKU</Label>
          <Input {...form.register('sku')} />
        </div>
        <div>
          <Label>Quantity</Label>
          <Input type="number" {...form.register('quantity')} />
        </div>
        <div>
          <Label>Threshold</Label>
          <Input type="number" {...form.register('threshold')} />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea {...form.register('description')} />
        </div>
        <Button className="w-full bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-primary">
          {isEdit ? 'Update' : 'Create'}
        </Button>
      </form>
    </BasePopover>
  );
}
