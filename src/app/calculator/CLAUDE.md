# Calculator Page Guidelines

This is the main interactive calculator page. Keep it focused and performant.

## Structure Overview
- Single-page calculator with step-by-step wizard
- Real-time calculations as users type
- Results sidebar always visible on desktop
- Mobile-responsive with stacked layout

## State Management
All state lives in Zustand store (`/store/calculator.ts`):
- User inputs
- Compensating factors
- Calculation results
- UI state (current step, loading, errors)

## Component Organization
```tsx
<CalculatorPage>
  <Header />
  <WizardStep />  // Progress indicator
  <MainContent>
    {/* Step-based forms */}
  </MainContent>
  <CalculationSidebar />  // Always visible on desktop
  <BorrowingPowerNotifications />  // Toast-like notifications
</CalculatorPage>
```

## Performance Optimizations
1. **Debounced calculations** - 300ms delay on input changes
2. **Silent calculations** - Don't navigate on every calc
3. **Memoized results** - Prevent unnecessary re-renders
4. **Lazy load heavy components** - DTI enhancement only when needed

## Form Handling Pattern
```tsx
// Use local state for immediate updates
const [value, setValue] = useState(initialValue)

// Debounced store update
useEffect(() => {
  const timeout = setTimeout(() => {
    updateUserInputs({ field: value })
  }, 300)
  return () => clearTimeout(timeout)
}, [value])
```

## Step Validation
Each step validates before allowing progression:
- Step 1: Location, income, FICO required
- Step 2: Property and loan details required  
- Step 3: Employment and debts required
- Step 4: Optional compensating factors

## Results Display
Results show when:
- All required fields filled
- Calculation completes successfully
- User explicitly triggers calculation

## Error Handling
- Field-level validation with inline errors
- Toast notifications for API failures
- Fallback to defaults when services fail

## Mobile Considerations
- Stack layout vertically on mobile
- Collapse sidebar into expandable section
- Larger touch targets (min 44px)
- Simplified navigation with swipe gestures

## Important Business Logic - DO NOT CHANGE
- **Comparison DTI**: The standard lenders comparison uses 45% DTI, NOT 43%. This is intentional and should not be changed without explicit permission.
  - Line ~555: `standardAmount={Math.round((results.maxHomePrice || 0) * (45 / (results.debtToIncomeRatio || 50)))}`
  - This represents typical industry standards for comparison purposes

## What NOT to Change
- Step order and flow
- Real-time calculation behavior  
- Zustand store integration
- Debounce timings
- Comparison DTI of 45% for standard lenders

## Testing Checklist
- [ ] All steps validate correctly
- [ ] Calculations update in real-time
- [ ] Results display accurately
- [ ] Mobile layout works
- [ ] Errors display properly
- [ ] Navigation between steps smooth