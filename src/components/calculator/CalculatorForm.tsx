"use client"

import * as React from "react"
import { Section } from "@/components/layout/Section"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useCalculatorStore } from "@/store/calculator"
import { cn } from "@/lib/utils"

// Import all the form components
import { LocationInput } from "./LocationInput"
import { IncomeInput } from "./IncomeInput"
import { CreditScoreSlider } from "./CreditScoreSlider"
import { DownPaymentSlider } from "./DownPaymentSlider"
import { StepIndicator } from "./StepIndicator"

interface CalculatorFormProps {
  className?: string
}

// Format currency for display
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function CalculatorForm({ className }: CalculatorFormProps) {
  const { 
    userInputs, 
    uiState, 
    fhaLoanResult,
    calculateFHABorrowingPower,
    nextStep,
    prevStep,
    validateCurrentStep
  } = useCalculatorStore()

  const { currentStep, isCalculating, showResults } = uiState

  // Check if we have minimum data for calculation
  const hasMinimumData = !!(
    userInputs.income &&
    userInputs.fico &&
    userInputs.monthlyDebts !== undefined
  )

  // Auto-calculate when we have enough data
  React.useEffect(() => {
    if (hasMinimumData && !isCalculating) {
      calculateFHABorrowingPower()
    }
  }, [hasMinimumData, calculateFHABorrowingPower, isCalculating])

  const handleNext = () => {
    if (validateCurrentStep()) {
      nextStep()
    }
  }

  const handlePrev = () => {
    prevStep()
  }

  const handleCalculate = () => {
    calculateFHABorrowingPower()
  }

  const canProceed = validateCurrentStep()

  return (
    <div className={cn("w-full", className)}>
      <Section maxWidth="2xl" className="space-y-8">
        {/* Step Indicator */}
        <StepIndicator />

        {/* Form Content */}
        <Card className="p-6 space-y-8">
          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Basic Information</h2>
                <p className="text-muted-foreground">
                  Let&apos;s start with your income and location
                </p>
              </div>
              
              <div className="space-y-6">
                <IncomeInput />
                <LocationInput />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Credit & Down Payment</h2>
                <p className="text-muted-foreground">
                  Your credit score and down payment determine your loan terms
                </p>
              </div>
              
              <div className="space-y-8">
                <CreditScoreSlider />
                <DownPaymentSlider />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Review & Calculate</h2>
                <p className="text-muted-foreground">
                  Review your information and get your borrowing power
                </p>
              </div>
              
              {/* Summary of inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-medium">Your Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Annual Income:</span>
                      <span className="font-medium">
                        {userInputs.income ? formatCurrency(userInputs.income) : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Debts:</span>
                      <span className="font-medium">
                        {userInputs.monthlyDebts ? formatCurrency(userInputs.monthlyDebts) : "$0"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Credit Score:</span>
                      <span className="font-medium">{userInputs.fico || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ZIP Code:</span>
                      <span className="font-medium">{userInputs.zipCode || "—"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium">Loan Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Down Payment:</span>
                      <span className="font-medium">
                        {userInputs.downPaymentPercent ? `${userInputs.downPaymentPercent}%` : "3.5%"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Loan Program:</span>
                      <span className="font-medium">FHA Loan</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Display */}
          {showResults && fhaLoanResult && (
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-green-800">
                    Your FHA Borrowing Power
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">
                      {formatCurrency(fhaLoanResult.maxHomePrice)}
                    </div>
                    <div className="text-sm text-green-600">Maximum Home Price</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">
                      {formatCurrency(fhaLoanResult.totalMonthlyPayment)}
                    </div>
                    <div className="text-sm text-green-600">Monthly Payment (PITI + MIP)</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">
                      {fhaLoanResult.debtToIncomeRatio.toFixed(1)}%
                    </div>
                    <div className="text-sm text-green-600">Debt-to-Income Ratio</div>
                  </div>
                </div>

                {fhaLoanResult.warnings && fhaLoanResult.warnings.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-amber-800">Important Notes:</h4>
                    <ul className="space-y-1 text-sm text-amber-700">
                      {fhaLoanResult.warnings.map((warning, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            <div className="flex gap-3">
              {hasMinimumData && !showResults && (
                <Button
                  onClick={handleCalculate}
                  disabled={isCalculating}
                  className="min-w-32"
                >
                  {isCalculating ? "Calculating..." : "Calculate Now"}
                </Button>
              )}
              
              {currentStep < 3 && (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="min-w-32"
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </Card>
      </Section>
    </div>
  )
}