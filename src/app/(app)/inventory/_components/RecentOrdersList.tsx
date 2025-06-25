// app/inventory/_components/RecentOrdersList.tsx
'use client'
import React from 'react'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

interface Order {
  id: string
  date: string
  description: string | null
  amount: number
  category: string
  status: string
}

interface RecentOrdersListProps {
  orders: Order[]
}

export default function RecentOrdersList({ orders }: RecentOrdersListProps) {
  return (
    <div className="bg-sidebar dark:bg-[#1E293B] rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-sidebar-foreground mb-4">
        Recent Orders
      </h3>
      <ul className="space-y-3">
        {orders.map(o => (
          <li key={o.id} className="flex justify-between items-center">
            <div>
              <p className="text-sm text-sidebar-foreground">
                {format(new Date(o.date), 'MMM d, yyyy')}
              </p>
              <p className="text-base text-sidebar-foreground font-medium">
                {o.description || '—'}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sidebar-foreground">
                ${o.amount.toFixed(2)}
              </p>
              <Badge
                variant="outline"
                className={
                  o.status === 'PENDING'
                    ? 'text-yellow-600 border-yellow-600'
                    : o.status === 'COMPLETED'
                      ? 'text-green-600 border-green-600'
                      : 'text-red-600 border-red-600'
                }
              >
                {o.status}
              </Badge>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
