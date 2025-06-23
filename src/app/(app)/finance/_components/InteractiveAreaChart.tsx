// components/ui/InteractiveAreaChart.tsx
'use client'
import * as React from 'react'
import { AreaChart, Area, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useIsMobile } from '@/hooks/use-mobile'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

interface TimeRangeOption {
  label: string
  value: string
  days: number
}
interface SeriesConfig<T> {
  key: keyof T
  label: string
  colorVar: string
}
interface InteractiveAreaChartProps<T> {
  title: string
  description?: string
  data: T[]
  dateKey: keyof T
  series: SeriesConfig<T>[]
  timeRangeOptions?: TimeRangeOption[]
  referenceDateKey?: keyof T
}

export function InteractiveAreaChart<T extends Record<string, any>>({
  title,
  description,
  data,
  dateKey,
  series,
  timeRangeOptions,
  referenceDateKey,
}: InteractiveAreaChartProps<T>) {
  const isMobile = useIsMobile()
  // Default ranges if not provided:
  const defaultRanges: TimeRangeOption[] = [
    { label: 'Last 3 months', value: '90d', days: 90 },
    { label: 'Last 30 days', value: '30d', days: 30 },
    { label: 'Last 7 days', value: '7d', days: 7 },
  ]
  const ranges = timeRangeOptions ?? defaultRanges

  // State for selected range value:
  const [timeRange, setTimeRange] = React.useState<string>(isMobile ? '7d' : '90d')

  // When mobile toggles, set default:
  React.useEffect(() => {
    if (isMobile) {
      setTimeRange(ranges.find(r => r.value === '7d')?.value || ranges[0].value)
    }
  }, [isMobile, ranges])

  // Determine reference date: either from data’s latest dateKey, or now
  const referenceDate = React.useMemo(() => {
    if (referenceDateKey) {
      // find max date in data
      let maxDate = new Date(0)
      data.forEach(item => {
        const d = new Date(item[referenceDateKey] as string)
        if (!isNaN(d.valueOf()) && d > maxDate) {
          maxDate = d
        }
      })
      return isNaN(maxDate.valueOf()) ? new Date() : maxDate
    }
    return new Date()
  }, [data, referenceDateKey])

  // Filter data according to selected timeRange
  const filteredData = React.useMemo(() => {
    const opt = ranges.find(r => r.value === timeRange)
    if (!opt) return data
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - opt.days)
    return data.filter(item => {
      const d = new Date(item[dateKey] as string)
      return !isNaN(d.valueOf()) && d >= startDate && d <= referenceDate
    })
  }, [data, dateKey, referenceDate, timeRange, ranges])

  // Build gradient definitions for each series
  const defs = series.map((s, idx) => {
    const id = `gradient-${String(s.key)}`
    const color = `var(${s.colorVar})`
    return (
      <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={color} stopOpacity={0.8} />
        <stop offset="95%" stopColor={color} stopOpacity={0.1} />
      </linearGradient>
    )
  })

  return (
    <Card className="@container/card bg-[var(--sidebar)] text-[var(--sidebar-foreground)]">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <CardAction>
          {/* ToggleGroup on larger screens */}
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(val) => val && setTimeRange(val)}
            variant="outline"
            className="hidden @[767px]/card:flex "
          >
            {ranges.map(r => (
              <ToggleGroupItem key={r.value} value={r.value}>
                {r.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {/* Select on smaller screens */}
          <Select
            value={timeRange}
            onValueChange={(val) => setTimeRange(val)}
          >
            <SelectTrigger
              className="flex w-40 @[767px]/card:hidden bg-sidebar-accent text-sidebar-accent-foreground"
              size="sm"
              aria-label="Select time range"
            >
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent className=" rounded-xl">
              {ranges.map(r => (
                <SelectItem key={r.value} value={r.value} className="rounded-lg">
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer className="aspect-auto h-[250px] w-full" config={
          // Construct ChartConfig dynamically (for tooltip indicators etc.)
          series.reduce((acc, s) => {
            acc[String(s.key)] = { label: s.label, color: `var(${s.colorVar})` }
            return acc
          }, {} as Record<string, { label: string; color: string }>)
        }>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData}>
              <defs>{defs}</defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={String(dateKey)}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={20}
                tickFormatter={(value) => {
                  const d = new Date(value as string)
                  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      const d = new Date(value as string)
                      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    }}
                    indicator="dot"
                  />
                }
              />
              {series.map(s => (
                <Area
                  key={String(s.key)}
                  dataKey={String(s.key)}
                  type="natural"
                  fill={`url(#gradient-${String(s.key)})`}
                  stroke={`var(${s.colorVar})`}
                  stackId="a"
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
