'use client'
import React from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
} from 'recharts'

interface StockTrendChartProps {
  data: Array<{ month: string; stock: number; cost: number }>
}

export default function StockTrendChart({ data }: StockTrendChartProps) {
  return (
    <div className="bg-sidebar rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-sidebar-foreground mb-4">
        Stock & Cost Trend
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <ComposedChart data={data}>
          <XAxis dataKey="month" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="stock"
            name="Stock Level"
            fill="var(--sidebar-accent)"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cost"
            name="Inventory Cost"
            stroke="var(--sidebar-primary)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
