"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

interface AnimatedCurrencyProps {
  value: number
  previousValue?: number
  showDifference?: boolean
  animationDuration?: number
  className?: string
  showFloatingChange?: boolean
}

export function AnimatedCurrency({
  value,
  previousValue,
  showDifference = true,
  animationDuration = 800,
  className,
  showFloatingChange = true
}: AnimatedCurrencyProps) {
  const [displayValue, setDisplayValue] = React.useState(previousValue || value)
  const [showChangeIndicator, setShowChangeIndicator] = React.useState(false)
  const difference = previousValue ? value - previousValue : 0
  const isIncrease = difference > 0
  const isDecrease = difference < 0

  React.useEffect(() => {
    if (previousValue === undefined || previousValue === value) {
      setDisplayValue(value)
      return
    }

    // Show change indicator
    if (showFloatingChange && difference !== 0) {
      setShowChangeIndicator(true)
      setTimeout(() => setShowChangeIndicator(false), 2000)
    }

    // Animate the number change
    const duration = animationDuration
    const startTime = Date.now()
    const startValue = previousValue
    const endValue = value

    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      
      const currentValue = startValue + (endValue - startValue) * easeOutQuart
      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, previousValue, animationDuration, showFloatingChange, difference])

  return (
    <div className="relative">
      <div 
        className={cn(
          "transition-all duration-300",
          isIncrease && "text-green-400",
          isDecrease && "text-red-400",
          className
        )}
      >
        ${Math.round(displayValue).toLocaleString()}
      </div>

      {showDifference && difference !== 0 && (
        <div className="flex items-center gap-1 mt-1">
          {isIncrease ? (
            <TrendingUp className="h-4 w-4 text-green-400" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-400" />
          )}
          <span className={cn(
            "text-sm",
            isIncrease ? "text-green-400" : "text-red-400"
          )}>
            {isIncrease ? '+' : ''}{Math.abs(difference).toLocaleString()}
          </span>
        </div>
      )}

      {/* Floating change indicator */}
      {showChangeIndicator && (
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 pointer-events-none",
            "animate-float-up text-2xl font-bold",
            isIncrease ? "text-green-400" : "text-red-400"
          )}
          style={{
            top: "-20px",
            animation: "floatUp 2s ease-out forwards"
          }}
        >
          {isIncrease ? '+' : '-'}${Math.abs(difference).toLocaleString()}
        </div>
      )}
    </div>
  )
}