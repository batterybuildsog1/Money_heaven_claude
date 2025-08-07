"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCalculatorStore } from "@/store/calculator"
import { cn } from "@/lib/utils"

interface LocationInputProps {
  className?: string
}

export function LocationInput({ className }: LocationInputProps) {
  const { userInputs, updateUserInputs, setError, clearError, uiState, calculatePropertyTax } = useCalculatorStore()
  const [zipValue, setZipValue] = React.useState(userInputs.zipCode || "")
  const [isValidating, setIsValidating] = React.useState(false)

  // Debounce ZIP code validation and property tax calculation
  React.useEffect(() => {
    if (zipValue.length !== 5) {
      clearError("zipCode")
      return
    }

    const zipPattern = /^[0-9]{5}$/
    if (!zipPattern.test(zipValue)) {
      setError("zipCode", "Please enter a valid 5-digit ZIP code")
      return
    }

    // Valid ZIP code - update store and trigger property tax calculation
    const timeoutId = setTimeout(async () => {
      clearError("zipCode")
      updateUserInputs({ zipCode: zipValue })
      
      // Auto-trigger property tax calculation if we have home value
      if (userInputs.homeValue) {
        setIsValidating(true)
        try {
          await calculatePropertyTax()
        } catch (error) {
          console.error("Property tax calculation failed:", error)
          setError("zipCode", "Unable to calculate property tax for this ZIP code")
        } finally {
          setIsValidating(false)
        }
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [zipValue, userInputs.homeValue, updateUserInputs, setError, clearError, calculatePropertyTax])

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 5)
    setZipValue(value)
  }

  const zipError = uiState.errors.zipCode
  const isLoading = isValidating || uiState.isCalculating

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="zipCode" className="text-sm font-medium">
        ZIP Code
      </Label>
      <div className="relative">
        <Input
          id="zipCode"
          type="text"
          value={zipValue}
          onChange={handleZipChange}
          placeholder="Enter 5-digit ZIP code"
          maxLength={5}
          className={cn(
            "transition-colors",
            zipError && "border-red-500 focus-visible:ring-red-500",
            isLoading && "opacity-75"
          )}
          aria-invalid={!!zipError}
          aria-describedby={zipError ? "zipCode-error" : undefined}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>
      {zipError && (
        <p id="zipCode-error" className="text-sm text-red-600" role="alert">
          {zipError}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Used to calculate local property taxes and insurance rates
      </p>
    </div>
  )
}