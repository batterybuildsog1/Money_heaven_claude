"use client"

import * as React from "react"
import { useCalculatorStore } from "@/store/calculator"
import { cn } from "@/lib/utils"

interface StepIndicatorProps {
  className?: string
  totalSteps?: number
}

export function StepIndicator({ className, totalSteps = 4 }: StepIndicatorProps) {
  const { uiState, goToStep, isStepComplete } = useCalculatorStore()
  const { currentStep } = uiState

  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1)

  const handleStepClick = (step: number) => {
    // Only allow navigation to previous steps or if the previous step is complete
    if (step <= currentStep || (step === currentStep + 1 && isStepComplete(currentStep))) {
      goToStep(step)
    }
  }

  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      {steps.map((step, index) => {
        const isCurrentStep = step === currentStep
        const isCompleted = isStepComplete(step)
        const isPrevious = step < currentStep
        const isClickable = step <= currentStep || (step === currentStep + 1 && isStepComplete(currentStep))

        return (
          <React.Fragment key={step}>
            <button
              onClick={() => handleStepClick(step)}
              disabled={!isClickable}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                {
                  // Current step
                  "bg-primary text-primary-foreground": isCurrentStep,
                  // Completed steps
                  "bg-green-100 text-green-700 border border-green-200": isPrevious && isCompleted,
                  // Incomplete previous steps
                  "bg-muted text-muted-foreground": isPrevious && !isCompleted,
                  // Future steps
                  "bg-muted/50 text-muted-foreground": step > currentStep,
                  // Clickable styles
                  "hover:bg-primary/90 cursor-pointer": isClickable && !isCurrentStep,
                  // Disabled styles
                  "cursor-not-allowed opacity-50": !isClickable
                }
              )}
              aria-label={`Step ${step}`}
              aria-current={isCurrentStep ? "step" : undefined}
            >
              {isPrevious && isCompleted ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                step
              )}
            </button>
            
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-8 h-0.5 transition-colors",
                  step < currentStep 
                    ? "bg-green-200" 
                    : "bg-muted"
                )}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}