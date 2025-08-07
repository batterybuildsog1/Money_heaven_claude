# Lib Directory Guidelines

Business logic and utilities live here. Keep functions pure and testable.

## Directory Structure
```
/lib
├── convex.tsx          # Convex client setup
├── utils.ts            # General utilities (cn, formatters)
├── types.ts            # Shared TypeScript types
├── theme.ts            # Theme configuration
│
├── fha-calculator.ts   # FHA loan calculations (now uses dynamic rates)
├── dti-factors.ts      # DTI enhancement logic
├── fha-limits.ts       # FHA county limits data
├── property-tax.ts     # Property tax calculations (uses hybrid caching)
│
├── insurance.ts        # Basic insurance estimates
└── insurance/          # Enhanced insurance module
    ├── index.ts
    ├── insurance-enhanced.ts
    ├── census-api.ts
    ├── risk-assessment.ts
    ├── county-rates-2025.ts
    └── types.ts
```

Note: xAI integration moved to convex/xai.ts following Convex patterns

## Core Principles

### 1. Pure Functions
```typescript
// Good - pure function
export function calculateMIP(loanAmount: number, ltv: number): number {
  if (ltv > 95) return loanAmount * 0.0055
  if (ltv > 90) return loanAmount * 0.0050
  return loanAmount * 0.0045
}

// Bad - side effects
export function calculateMIP(loanAmount: number): number {
  const ltv = store.getState().ltv // NO! Pass as parameter
  updateDatabase(loanAmount) // NO! Keep it pure
}
```

### 2. Clear Exports
```typescript
// Good - named exports for everything
export { calculateFHALoan, validateFHAEligibility }

// Bad - mixing default and named
export default calculateFHALoan
export { validateFHAEligibility }
```

### 3. Type Everything
```typescript
// Good - explicit types
export function calculateDTI(
  income: number,
  debts: number,
  housingPayment: number
): DTIResult {
  // ...
}

// Bad - relying on inference
export function calculateDTI(income, debts, housingPayment) {
  // ...
}
```

## Module Patterns

### Calculation Modules (fha-calculator.ts, dti-factors.ts)
- Export pure calculation functions
- Include validation functions
- Return detailed results with warnings
- NO external API calls

### API Modules (xai.ts, census-api.ts)
- Handle all HTTP logic
- Include retry/timeout logic
- Return typed responses
- Cache when appropriate

### Data Modules (fha-limits.ts, county-rates-2025.ts)
- Static data only
- Typed exports
- Annual update reminders in comments

### Utility Module (utils.ts)
Keep it minimal:
```typescript
// cn - class name utility (from shadcn)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add only TRULY reusable utilities
```

## Error Handling Pattern

For calculation functions:
```typescript
export function calculateFHALoan(params: FHAParams): FHAResult {
  // Validate inputs
  if (params.income <= 0) {
    return {
      success: false,
      error: 'Income must be positive',
      maxLoanAmount: 0
    }
  }
  
  // Calculate
  try {
    const result = complexCalculation(params)
    return {
      success: true,
      ...result
    }
  } catch (error) {
    return {
      success: false,
      error: 'Calculation failed',
      maxLoanAmount: 0
    }
  }
}
```

For API functions:
```typescript
export async function fetchPropertyTax(zip: string): Promise<TaxResult> {
  try {
    const response = await fetch(url, { 
      signal: AbortSignal.timeout(10000) 
    })
    
    if (!response.ok) {
      // Return fallback, don't throw
      return { rate: DEFAULT_RATE, confidence: 'low' }
    }
    
    return await response.json()
  } catch (error) {
    // Always return usable fallback
    return { rate: DEFAULT_RATE, confidence: 'low' }
  }
}
```

## Testing Guidelines

Each module should be independently testable:
```typescript
// fha-calculator.test.ts
describe('calculateFHALoan', () => {
  it('calculates correct loan amount', () => {
    const result = calculateFHALoan({
      income: 80000,
      monthlyDebts: 500,
      downPaymentPercent: 3.5  // Changed from downPayment amount to percentage
    })
    expect(result.maxLoanAmount).toBe(425000)
  })
})
```

## Performance Considerations

### Memoization (when needed)
```typescript
// Only for expensive calculations
const memoizedCalculation = memoize((input: ComplexInput) => {
  // Expensive calculation
})
```

### Caching Pattern
For external API responses (like property tax data), we use the hybrid caching pattern:
- Store results in Convex database (persistent across restarts)
- Use Convex queries for reading (auto-cached)
- Use Convex actions for external API calls
- See convex/CLAUDE.md for the full pattern

```typescript
// Example: property-tax.ts hybrid pattern
export async function getPropertyTaxRate(location: string) {
  // 1. Try cache first (fast, auto-cached query)
  const cached = await convexClient.query(api.propertyTax.getCachedRate, { location })
  if (cached) return cached
  
  // 2. Cache miss - fetch fresh data (slow, external API)
  const fresh = await convexClient.action(api.xai.getPropertyTaxRate, { location })
  return fresh // Action stores result for next time
}
```

## What NOT to Put Here

- React components (use /components)
- Store logic (use /store)
- Page-specific logic (keep in pages)
- Test files (colocate with source)

## Adding New Modules

Before adding a new file, ask:
1. Is this truly reusable?
2. Does it contain business logic?
3. Can it be tested in isolation?

If not all YES, it belongs elsewhere.

## API Integration Rules

1. **Always provide fallbacks** - Never let API failures break the app
2. **Set reasonable timeouts** - 10 seconds max
3. **Log errors for debugging** - But don't expose to users
4. **Cache when sensible** - Property tax rates don't change daily

That's it. Keep lib/ focused on business logic and utilities.