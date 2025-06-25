'use client'

import { SetStateAction, useEffect, useState } from 'react'
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
import axios from 'axios'
import { useFinanceCategories } from '@/lib/hooks/finance'
import { toast } from 'react-hot-toast'
import { z } from 'zod'
import axiosdb from '@/lib/axios'

const transactionSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be positive'),
  description: z.string().min(3, 'Description is too short'),
  type: z.enum(['ORDER', 'REFUND', 'PAYMENT']),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']),
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

export default function NewTransactionPopover() {
  const { data: categories } = useFinanceCategories()
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
      const data: TransactionForm = {
        amount: parseFloat(amount),
        description,
        type,
        status,
        categoryId: selectedCategory?.id || '',
      }
      transactionSchema.parse(data)

      await axiosdb.post('/api/finance/transactions', data)

      toast.success('Transaction submitted!')
      setAmount('')
      setDescription('')
      setSelectedCategory(null)
      setType('PAYMENT')
      setStatus('PENDING')
    } catch (error: any) {
      const message = error?.errors?.[0]?.message || 'Validation error'
      toast.error(message)
    }
  }

  return (
    <BasePopover title="New Transaction" buttonLabel="Add Transaction">
      <div className="w-full max-w-3xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'].map((s) => (
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
            <Select onValueChange={handleCategorySelect}>
              <SelectTrigger className="bg-sidebar">
                <SelectValue placeholder="Select category" />
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
          <Button onClick={handleSubmit} className="w-full bg-sidebar-accent hover:bg-sidebar-primary text-sidebar-accent-foreground">
            Submit Transaction
          </Button>
        </div>
      </div>
    </BasePopover>
  )
}
