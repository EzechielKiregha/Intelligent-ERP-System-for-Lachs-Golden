'use client'
import React from 'react'
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface MetricCardProps {
  description: string            // e.g. "Total Revenue"
  value: number                  // main numeric value
  formatValue?: (v: number) => string  // optional formatter, e.g. currency
  percentChange?: number         // e.g. +12.5 or -8.3
  footerMessage?: string         // e.g. "Compared to last month"
  footerSubtext?: string         // e.g. "Based on trends"
  // Optionally allow custom badge variant or colors, but default handles up/down
}

export function MetricCard({
  description,
  value,
  formatValue,
  percentChange,
  footerMessage,
  footerSubtext,
}: MetricCardProps) {
  // Determine formatted main value
  const displayValue = formatValue
    ? formatValue(value)
    : value.toString()

  // Determine badge content if percentChange provided
  const showBadge = typeof percentChange === 'number'
  const isUp = showBadge && percentChange >= 0

  return (
    <Card className="@container/card bg-[var(--sidebar)] text-[var(--sidebar-foreground)]">
      <CardHeader>
        <CardDescription>{description}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {displayValue}
        </CardTitle>
        {showBadge && (
          <CardAction>
            <Badge variant="outline" className="flex items-center space-x-1">
              {isUp ? <IconTrendingUp className="w-4 h-4" /> : <IconTrendingDown className="w-4 h-4" />}
              <span>
                {Math.abs(percentChange).toFixed(1)}%
              </span>
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      {(footerMessage || footerSubtext) && (
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {footerMessage && (
            <div className="line-clamp-1 flex gap-2 font-medium">
              {footerMessage} {isUp
                ? <IconTrendingUp className="size-4" />
                : showBadge
                  ? <IconTrendingDown className="size-4" />
                  : null
              }
            </div>
          )}
          {footerSubtext && (
            <div className="text-muted-foreground">{footerSubtext}</div>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
