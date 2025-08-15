"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  value?: number
  showPercentage?: boolean
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'indigo' | 'default'
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

const colorVariants = {
  default: {
    background: "bg-primary/20",
    indicator: "bg-primary"
  },
  blue: {
    background: "bg-blue-100",
    indicator: "bg-blue-600"
  },
  green: {
    background: "bg-green-100", 
    indicator: "bg-green-600"
  },
  yellow: {
    background: "bg-yellow-100",
    indicator: "bg-yellow-500"
  },
  red: {
    background: "bg-red-100",
    indicator: "bg-red-600"
  },
  indigo: {
    background: "bg-indigo-100",
    indicator: "bg-indigo-600"
  }
}

const sizeVariants = {
  sm: "h-2",
  md: "h-3", 
  lg: "h-4"
}

function Progress({
  className,
  value,
  showPercentage = false,
  color = 'default',
  size = 'md',
  animated = false,
  ...props
}: ProgressProps) {
  const percentage = Math.min((value || 0), 100)
  const colors = colorVariants[color]
  
  return (
    <div className="w-full">
      <ProgressPrimitive.Root
        data-slot="progress"
        className={cn(
          "relative w-full overflow-hidden rounded-full",
          colors.background,
          sizeVariants[size],
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className={cn(
            "h-full w-full flex-1",
            colors.indicator,
            animated ? "transition-all duration-500 ease-out" : "transition-all"
          )}
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </ProgressPrimitive.Root>
      {showPercentage && (
        <div className="mt-1 text-sm text-gray-600 text-right">
          {percentage.toFixed(1)}%
        </div>
      )}
    </div>
  )
}

export { Progress }
