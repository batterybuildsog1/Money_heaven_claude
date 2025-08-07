# Zustand Store Guidelines

We have ONE store for calculator state. Keep it that way.

## Core Principles
1. **Single store, multiple slices** - All calculator state in one place
2. **Actions in the store** - Logic lives here, not in components
3. **Type everything** - Full TypeScript support
4. **Selective subscriptions** - Components only subscribe to what they need

## Store Structure Pattern

```typescript
interface CalculatorStore {
  // State slices
  userInputs: UserInputs
  compensatingFactors: CompensatingFactors
  results: CalculationResults
  uiState: UIState
  
  // Actions (grouped by purpose)
  updateUserInputs: (inputs: Partial<UserInputs>) => void
  updateCompensatingFactors: (factors: Partial<CompensatingFactors>) => void
  
  // Complex actions
  calculateFHABorrowingPower: () => void
  
  // UI actions
  setUIState: (state: Partial<UIState>) => void
  setError: (field: string, error: string) => void
}
```

## Best Practices

### 1. Immutable Updates
```typescript
// Good - spread for immutability
updateUserInputs: (inputs) => set((state) => ({
  userInputs: { ...state.userInputs, ...inputs }
}))

// Bad - mutating state
updateUserInputs: (inputs) => set((state) => {
  state.userInputs.income = inputs.income // NO!
})
```

### 2. Selective Subscriptions in Components
```typescript
// Good - only subscribe to needed state
const { userInputs, updateUserInputs } = useCalculatorStore()

// Better - use selector for specific fields
const income = useCalculatorStore((state) => state.userInputs.income)

// Bad - subscribing to entire store
const store = useCalculatorStore()
```

### 3. Keep Business Logic in Store
```typescript
// Good - calculation logic in store
calculateFHABorrowingPower: () => {
  const { userInputs, compensatingFactors } = get()
  // Complex calculation logic here
  set({ results: calculatedResults })
}

// Bad - calculation in component
const MyComponent = () => {
  const inputs = useCalculatorStore(state => state.userInputs)
  const results = calculateFHA(inputs) // NO! Do this in store
}
```

### 4. Unified Calculation Pattern
Use a single calculation function for consistency:
```typescript
// One source of truth for all calculations
calculateFHABorrowingPower: () => {
  // Uses calculateFHALoanWithFactors internally
  // This iterative calculation ensures DTI and loan amounts are always in sync
  // Automatically handles compensating factors
}
```

## What to Store

### DO Store:
- User inputs (form data)
- Calculation results
- UI state (loading, errors, current step)
- Temporary calculation data (DTI progress)

### DON'T Store:
- Derived values (calculate on-the-fly)
- Component-specific UI state (use local state)
- Static data (keep in lib/)
- API responses (use React Query if needed)

## Error Handling Pattern

```typescript
setError: (field: string, error: string) => {
  set((state) => ({
    uiState: {
      ...state.uiState,
      errors: { ...state.uiState.errors, [field]: error }
    }
  }))
}

clearError: (field: string) => {
  set((state) => {
    const newErrors = { ...state.uiState.errors }
    delete newErrors[field]
    return {
      uiState: { ...state.uiState, errors: newErrors }
    }
  })
}
```

## Async Actions Pattern

```typescript
calculatePropertyTax: async () => {
  try {
    set((state) => ({
      uiState: { ...state.uiState, isCalculating: true }
    }))
    
    const result = await getPropertyTaxInfo(...)
    
    set((state) => ({
      results: { ...state.results, propertyTax: result },
      uiState: { ...state.uiState, isCalculating: false }
    }))
  } catch (error) {
    set((state) => ({
      uiState: { 
        ...state.uiState, 
        isCalculating: false,
        errors: { ...state.uiState.errors, propertyTax: 'Failed' }
      }
    }))
  }
}
```

## Testing the Store

Simple approach:
```typescript
// Get store instance
const store = useCalculatorStore.getState()

// Test actions
store.updateUserInputs({ income: 80000 })
expect(store.userInputs.income).toBe(80000)

// Test calculations
store.calculateFHABorrowingPower()
expect(store.results.maxLoanAmount).toBeGreaterThan(0)
```

## When to Split the Store

Only split when you have DISTINCT features:
- If we add user preferences → `usePreferencesStore`
- If we add comparison feature → `useComparisonStore`
- If we add admin features → `useAdminStore`

Current calculator functionality stays in ONE store.

## Performance Tips

1. **Use get() in actions** to access current state
2. **Batch updates** when possible
3. **Don't store computed values** - calculate them
4. **Use shallow equality** for primitive comparisons

That's it. One store, clear patterns, simple to understand and maintain.