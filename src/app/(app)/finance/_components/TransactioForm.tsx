'use client'

import { SetStateAction, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import BasePopover from '@/components/BasePopover'
import { useFinanceCategories, useCreateTransaction } from '@/lib/hooks/finance' // Import useCreateTransaction
import { toast } from 'sonner'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

const transactionSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be positive'),
  description: z.string().min(3, 'Description is too short'),
  type: z.enum(['ORDER', 'REFUND', 'PAYMENT']), // Matches your form's types
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']), // Matches your form's statuses
  categoryId: z.string().min(1, 'Category is required'),
})

type TransactionForm = z.infer<typeof transactionSchema>

interface Category {
  id: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  budgetLimit: number
  budgetUsed: number
}

const transactionTypes = ['ORDER', 'REFUND', 'PAYMENT'] as const
const transactionStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'] as const // Define statuses for mapping

export default function NewTransactionPopover() {
  const { data: categories, isLoading: isLoadingCategories } = useFinanceCategories();
  const createTransactionMutation = useCreateTransaction(); // Initialize the mutation hook
  const router = useRouter()

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [type, setType] = useState<'ORDER' | 'REFUND' | 'PAYMENT'>('PAYMENT')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'>('PENDING')

  const handleCategorySelect = (categoryId: string) => {
    if (categories) {
      const cat = categories.find((c) => c.id === categoryId)
      setSelectedCategory(cat || null)
    } else {
      setSelectedCategory(null)
    }
  }

  const handleSubmit = async () => {
    try {
      const dataToValidate: TransactionForm = {
        amount: parseFloat(amount),
        description,
        type,
        status,
        categoryId: selectedCategory?.id || '',
      }

      // Validate data using Zod before sending
      transactionSchema.parse(dataToValidate);

      // Call the mutate function from the React Query hook
      // The hook's onSuccess/onError will handle toasts and query invalidation
      await createTransactionMutation.mutateAsync(dataToValidate); // Use mutateAsync to await the result

      // Clear the form fields only on successful submission
      setAmount('');
      setDescription('');
      setSelectedCategory(null);
      setType('PAYMENT');
      setStatus('PENDING');

      // If BasePopover is a controlled component and needs to be closed
      // You might need a prop like onClose from BasePopover if it's a modal/dialog
      // For example: if (props.onClose) props.onClose();
      router.refresh()
    } catch (error: any) {
      // Zod validation errors
      if (error.errors && error.errors.length > 0) {
        toast.error(error.errors[0].message);
      } else {
        // This catch block will now mostly handle Zod validation errors
        // API errors are handled by the onError in useCreateTransaction hook
        toast.error('An unexpected validation error occurred.');
      }
    }
  }

  return (
    <BasePopover title="New Transaction" buttonLabel="Add Transaction">
      <div className="w-full max-w-3xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap- text-sidebar-foreground">
          <div>
            <Label>Transaction Type</Label>
            <Select value={type} onValueChange={(val) => setType(val as typeof type)}>
              <SelectTrigger className="bg-sidebar">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-sidebar">
                {transactionTypes.map((t) => (
                  <SelectItem
                    key={t}
                    value={t}
                    className="hover:bg-sidebar-accent"
                  >
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={(val) => setStatus(val as typeof status)}>
              <SelectTrigger className="bg-sidebar">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-sidebar">
                {transactionStatuses.map((s) => ( // Use transactionStatuses here
                  <SelectItem
                    key={s}
                    value={s}
                    className="hover:bg-sidebar-accent"
                  >
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Category</Label>
            <Select onValueChange={handleCategorySelect} value={selectedCategory?.id || ''}> {/* Add value prop for controlled component */}
              <SelectTrigger className="bg-sidebar">
                {isLoadingCategories ? (
                  <SelectValue placeholder="Loading categories..." />
                ) : (
                  <SelectValue placeholder="Select category" />
                )}
              </SelectTrigger>
              <SelectContent className="bg-sidebar">
                {categories &&
                  categories.map((cat) => (
                    <SelectItem
                      key={cat.id}
                      value={cat.id}
                      className="hover:bg-sidebar-accent"
                    >
                      {cat.name} ({cat.type})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCategory && (
            <div className="text-sm text-muted-foreground pt-6">
              Budget: ${selectedCategory.budgetLimit.toLocaleString()} used ${selectedCategory.budgetUsed.toLocaleString()}
            </div>
          )}

          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              placeholder="e.g. 2500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <Label>Description</Label>
            <Textarea
              placeholder="e.g. Purchase of 3 monitors from Tech Supplier"
              value={description}
              onChange={(e: { target: { value: SetStateAction<string> } }) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-4">
          <Button
            onClick={handleSubmit}
            className="w-full bg-sidebar-accent hover:bg-sidebar-primary text-sidebar-accent-foreground"
            disabled={createTransactionMutation.isPending || isLoadingCategories} // Disable while creating or loading categories
          >
            {createTransactionMutation.isPending ? 'Submitting...' : 'Submit Transaction'}
          </Button>
        </div>
      </div>
    </BasePopover>
  )
}
