"use client"

import * as React from "react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { useCalculatorStore } from "@/store/calculator"
import { cn } from "@/lib/utils"

interface DownPaymentSliderProps {
  className?: string
}

// Format currency with commas
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function DownPaymentSlider({ className }: DownPaymentSliderProps) {
  const { userInputs, updateUserInputs, results } = useCalculatorStore()
  
  // Use actual calculated home price from results
  const maxHomePrice = results?.maxHomePrice || 300000
  
  // Current down payment percentage (default to 3.5% for FHA)
  const currentPercentage = userInputs.downPaymentPercent || 3.5

  const handlePercentageChange = (values: number[]) => {
    const newPercentage = values[0]
    updateUserInputs({ downPaymentPercent: newPercentage })
  }

  // Calculate dollar amount for display
  const currentAmount = Math.round(maxHomePrice * (currentPercentage / 100))

  // Determine if this meets FHA minimum
  const meetsFHAMinimum = currentPercentage >= 3.5
  const isHighDownPayment = currentPercentage >= 10

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Down Payment
        </Label>
        <div className="flex items-center justify-between">
          <div className={cn(
            "px-3 py-1 rounded-full text-sm font-medium transition-colors",
            meetsFHAMinimum 
              ? isHighDownPayment 
                ? "text-green-600 bg-green-100" 
                : "text-blue-600 bg-blue-100"
              : "text-red-600 bg-red-100"
          )}>
            {currentPercentage.toFixed(1)}%
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {formatCurrency(currentAmount)}
            </div>
            <div className="text-xs text-muted-foreground">
              {isHighDownPayment ? "Great!" : meetsFHAMinimum ? "FHA Eligible" : "Below FHA Min"}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Slider
          value={[currentPercentage]}
          onValueChange={handlePercentageChange}
          min={3.5}
          max={20}
          step={0.5}
          className="w-full"
          aria-label="Down payment percentage selector"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>3.5%</span>
          <span>FHA Min</span>
          <span>20%</span>
        </div>
      </div>

      <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
        <div className="text-sm font-medium">
          Max Home Price: {formatCurrency(maxHomePrice)}
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Down Payment</div>
            <div className="font-medium">{formatCurrency(currentAmount)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Loan Amount</div>
            <div className="font-medium">{formatCurrency(maxHomePrice - currentAmount)}</div>
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          • FHA loans require minimum 3.5% down payment
        </p>
        <p>
          • 10%+ down payment may help with loan approval
        </p>
        <p>
          • Higher down payment = lower monthly payment
        </p>
      </div>
    </div>
  )
}