"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCalculatorStore } from "@/store/calculator"
import { cn } from "@/lib/utils"

interface IncomeInputProps {
  className?: string
}

// Format number with commas
const formatCurrency = (value: string): string => {
  // Remove non-numeric characters except decimal point
  const cleanValue = value.replace(/[^\d.]/g, "")
  
  // Split into integer and decimal parts
  const parts = cleanValue.split(".")
  const integerPart = parts[0]
  const decimalPart = parts[1]
  
  // Add commas to integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  
  // Return formatted value
  if (decimalPart !== undefined) {
    return `${formattedInteger}.${decimalPart.slice(0, 2)}`
  }
  return formattedInteger
}

// Parse formatted currency to number
const parseCurrency = (value: string): number => {
  const cleanValue = value.replace(/[^\d.]/g, "")
  return parseFloat(cleanValue) || 0
}

export function IncomeInput({ className }: IncomeInputProps) {
  const { userInputs, updateUserInputs, setError, clearError, uiState } = useCalculatorStore()
  
  const [incomeValue, setIncomeValue] = React.useState(
    userInputs.income ? formatCurrency(userInputs.income.toString()) : ""
  )
  const [debtsValue, setDebtsValue] = React.useState(
    userInputs.monthlyDebts ? formatCurrency(userInputs.monthlyDebts.toString()) : ""
  )

  // Debounced update for income
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      const numericValue = parseCurrency(incomeValue)
      if (numericValue < 0) {
        setError("income", "Income must be a positive number")
        return
      }
      
      clearError("income")
      if (numericValue !== userInputs.income) {
        updateUserInputs({ income: numericValue || undefined })
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [incomeValue, userInputs.income, updateUserInputs, setError, clearError])

  // Debounced update for monthly debts
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      const numericValue = parseCurrency(debtsValue)
      if (numericValue < 0) {
        setError("monthlyDebts", "Monthly debts must be a positive number")
        return
      }
      
      clearError("monthlyDebts")
      if (numericValue !== userInputs.monthlyDebts) {
        updateUserInputs({ monthlyDebts: numericValue || 0 })
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [debtsValue, userInputs.monthlyDebts, updateUserInputs, setError, clearError])

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value)
    setIncomeValue(formatted)
  }

  const handleDebtsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value)
    setDebtsValue(formatted)
  }

  const incomeError = uiState.errors.income
  const debtsError = uiState.errors.monthlyDebts

  return (
    <div className={cn("space-y-6", className)}>
      {/* Annual Income */}
      <div className="space-y-2">
        <Label htmlFor="income" className="text-sm font-medium">
          Annual Gross Income
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            id="income"
            type="text"
            value={incomeValue}
            onChange={handleIncomeChange}
            placeholder="75,000"
            className={cn(
              "pl-8 transition-colors",
              incomeError && "border-red-500 focus-visible:ring-red-500"
            )}
            aria-invalid={!!incomeError}
            aria-describedby={incomeError ? "income-error" : "income-help"}
          />
        </div>
        {incomeError && (
          <p id="income-error" className="text-sm text-red-600" role="alert">
            {incomeError}
          </p>
        )}
        <p id="income-help" className="text-xs text-muted-foreground">
          Your total annual income before taxes and deductions
        </p>
      </div>

      {/* Monthly Debts */}
      <div className="space-y-2">
        <Label htmlFor="monthlyDebts" className="text-sm font-medium">
          Monthly Debt Payments
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            id="monthlyDebts"
            type="text"
            value={debtsValue}
            onChange={handleDebtsChange}
            placeholder="1,200"
            className={cn(
              "pl-8 transition-colors",
              debtsError && "border-red-500 focus-visible:ring-red-500"
            )}
            aria-invalid={!!debtsError}
            aria-describedby={debtsError ? "monthlyDebts-error" : "monthlyDebts-help"}
          />
        </div>
        {debtsError && (
          <p id="monthlyDebts-error" className="text-sm text-red-600" role="alert">
            {debtsError}
          </p>
        )}
        <p id="monthlyDebts-help" className="text-xs text-muted-foreground">
          Credit cards, car loans, student loans, and other monthly obligations
        </p>
      </div>
    </div>
  )
}