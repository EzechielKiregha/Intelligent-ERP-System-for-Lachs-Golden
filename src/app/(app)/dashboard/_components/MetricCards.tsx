// import React from 'react';
// import { ArrowUp, ArrowDown } from 'lucide-react';

// interface MetricCardProps {
//   icon: React.ReactNode;
//   title: string;
//   value: string;
//   delta?: string; // e.g., "+24%", "-3%"
//   deltaType?: 'increase' | 'decrease';
//   subtitle?: string; // e.g., "vs last month", "Active orders"
// }

// const MetricCard: React.FC<MetricCardProps> = ({ icon, title, value, delta, deltaType, subtitle }) => {
//   return (
//     <div className="bg-white dark:bg-[#1E293B] rounded-lg shadow p-4 flex items-center justify-between">
//       {/* Icon */}
//       <div className="p-2 bg-[#FEF3C7] dark:bg-[#3E3E3E] rounded-full">
//         {icon}
//       </div>

//       {/* Metric Info */}
//       <div className="flex-1 ml-4">
//         <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
//         <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
//         {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
//       </div>

//       {/* Delta */}
//       {delta && (
//         <div className={`flex items-center text-sm ${deltaType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
//           {deltaType === 'increase' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
//           <span className="ml-1">{delta}</span>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MetricCard;
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
  icon: React.ReactNode;
  title: string;
  // description: string            // e.g. "Total Revenue"
  value: string;
  // value: number                  // main numeric value
  // formatValue?: (v: number) => string  // optional formatter, e.g. currency
  delta?: string; // e.g., "+24%", "-3%"
  deltaType?: 'increase' | 'decrease' | 'neutral';
  // percentChange?: number         // e.g. +12.5 or -8.3
  footerMessage?: string         // e.g. "Compared to last month"
  footerSubtext?: string         // e.g. "Based on trends"
  // Optionally allow custom badge variant or colors, but default handles up/down
}

export function MetricCard({
  // description,
  icon,
  title,
  value,
  // formatValue,
  delta,
  deltaType,
  // percentChange,
  footerMessage,
  footerSubtext,
}: MetricCardProps) {
  // Determine formatted main value
  // const displayValue = formatValue
  //   ? formatValue(value)
  //   : value.toString()

  // Determine badge content if percentChange provided
  const showBadge = typeof deltaType === 'string'
  const isUp = showBadge && deltaType === 'increase'

  return (
    <Card className="@container/card bg-[var(--sidebar)] text-[var(--sidebar-foreground)]">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl flex flex-row pt-2 justify-between font-semibold tabular-nums @[250px]/card:text-3xl">
          <div className="p-2 w-12 h-12 justify-center flex items-center bg-sidebar-primary rounded-full">
            {icon}
          </div>
          <div className="">{value}</div>
        </CardTitle>
        {showBadge && (
          <CardAction>
            <Badge variant="outline" className="flex items-center space-x-1">
              {isUp ? <IconTrendingUp className="w-4 h-4" /> : <IconTrendingDown className="w-4 h-4" />}
              <span>
                {delta}
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
