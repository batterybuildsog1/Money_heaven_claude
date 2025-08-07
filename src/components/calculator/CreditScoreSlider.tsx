"use client"

import * as React from "react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { useCalculatorStore } from "@/store/calculator"
import { cn } from "@/lib/utils"

interface CreditScoreSliderProps {
  className?: string
}

// Credit score ranges and colors
const getCreditScoreInfo = (score: number) => {
  if (score >= 800) {
    return { 
      label: "Excellent", 
      color: "text-green-600", 
      bgColor: "bg-green-100", 
      description: "Best rates available" 
    }
  }
  if (score >= 740) {
    return { 
      label: "Very Good", 
      color: "text-green-500", 
      bgColor: "bg-green-50", 
      description: "Great rates" 
    }
  }
  if (score >= 670) {
    return { 
      label: "Good", 
      color: "text-blue-600", 
      bgColor: "bg-blue-100", 
      description: "Good rates" 
    }
  }
  if (score >= 580) {
    return { 
      label: "Fair", 
      color: "text-yellow-600", 
      bgColor: "bg-yellow-100", 
      description: "FHA eligible" 
    }
  }
  return { 
    label: "Poor", 
    color: "text-red-600", 
    bgColor: "bg-red-100", 
    description: "Limited options" 
  }
}

export function CreditScoreSlider({ className }: CreditScoreSliderProps) {
  const { userInputs, updateUserInputs } = useCalculatorStore()
  const currentScore = userInputs.fico || 580

  const handleScoreChange = (values: number[]) => {
    const newScore = values[0]
    updateUserInputs({ fico: newScore })
  }

  const scoreInfo = getCreditScoreInfo(currentScore)

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Credit Score (FICO)
        </Label>
        <div className="flex items-center justify-between">
          <div className={cn(
            "px-3 py-1 rounded-full text-sm font-medium transition-colors",
            scoreInfo.color,
            scoreInfo.bgColor
          )}>
            {scoreInfo.label}
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {currentScore}
            </div>
            <div className="text-xs text-muted-foreground">
              {scoreInfo.description}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Slider
          value={[currentScore]}
          onValueChange={handleScoreChange}
          min={580}
          max={850}
          step={5}
          className="w-full"
          aria-label="Credit score selector"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>580</span>
          <span>FHA Min</span>
          <span>850</span>
        </div>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <p>
          FHA loans require a minimum credit score of 580 for 3.5% down payment
        </p>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-100 border border-red-200" />
            <span>580-669: Fair</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200" />
            <span>670-739: Good</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-100 border border-green-200" />
            <span>740-799: Very Good</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-200 border border-green-300" />
            <span>800+: Excellent</span>
          </div>
        </div>
      </div>
    </div>
  )
}