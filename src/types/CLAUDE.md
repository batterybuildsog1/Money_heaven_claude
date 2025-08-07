# TypeScript Types Guidelines

Central type definitions. Keep them organized and DRY.

## Structure
```
/types
└── index.ts    # All shared types in ONE file
```

## Type Organization Pattern

Group by feature/domain:
```typescript
// User Input Types
export interface UserInputs {
  income?: number
  fico?: number
  location?: string
  // ...
}

// Calculation Types
export interface CalculationResults {
  maxLoanAmount: number
  maxHomePrice: number
  // ...
}

// API Response Types
export interface PropertyTaxResponse {
  rate: number
  confidence: 'high' | 'medium' | 'low'
  // ...
}
```

## Best Practices

### 1. Use Interfaces for Objects
```typescript
// Good - interface for object shapes
export interface Scenario {
  id: string
  userId: string
  inputs: UserInputs
}

// Less preferred - type alias for objects
export type Scenario = {
  id: string
  userId: string
}
```

### 2. Use Type Aliases for Unions/Utilities
```typescript
// Good - type for unions
export type DTIStatus = 'standard' | 'enhanced' | 'maxed'

// Good - type for utility types  
export type PartialInputs = Partial<UserInputs>
```

### 3. Avoid Enums - Use Union Types
```typescript
// Good - union type
export type LoanProgram = 'FHA' | 'VA' | 'Conventional'

// Avoid - enum
export enum LoanProgram {
  FHA = 'FHA',
  VA = 'VA'
}
```

### 4. Optional vs Required Fields
```typescript
// Be explicit about optionality
export interface UserInputs {
  // Required fields
  income: number
  
  // Optional fields  
  zipCode?: string
  currentHousingPayment?: number
}
```

### 5. Const Assertions for Constants
```typescript
// Good - const assertion
export const FHA_REQUIREMENTS = {
  minFICO: 580,
  minDownPayment: 0.035,
  maxDTI: 0.43
} as const

// Type from const
export type FHARequirement = typeof FHA_REQUIREMENTS
```

## Naming Conventions

- **Interfaces**: PascalCase, descriptive (`UserInputs`, not `IUserInputs`)
- **Type aliases**: PascalCase (`DTIStatus`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_LOAN_AMOUNT`)

## What Goes Here vs Elsewhere

### In types/index.ts:
- Shared interfaces used across modules
- API request/response types
- Domain models (User, Scenario, etc.)
- Utility types used in multiple places

### Keep Local:
- Component-specific props interfaces
- Internal module types
- Single-use types

## Example Structure
```typescript
// ============ Domain Models ============
export interface User {
  id: string
  email: string
}

// ============ Input Types ============
export interface UserInputs {
  income?: number
  fico?: number
}

// ============ Result Types ============
export interface CalculationResults {
  maxLoanAmount: number
}

// ============ API Types ============
export interface CensusAPIResponse {
  county: string
  state: string
}

// ============ Constants ============
export const LOAN_LIMITS = {
  standard: 498250,
  highCost: 1149825
} as const
```

## Anti-Patterns to Avoid

### 1. Over-Nesting
```typescript
// Bad - too nested
export interface App {
  user: {
    profile: {
      settings: {
        notifications: boolean
      }
    }
  }
}

// Good - flat structure
export interface UserSettings {
  notifications: boolean
}
```

### 2. Premature Abstraction
```typescript
// Bad - too generic
export interface Entity<T> {
  id: string
  data: T
}

// Good - specific types
export interface Scenario {
  id: string
  inputs: UserInputs
}
```

### 3. Circular Dependencies
Keep types independent - they shouldn't import from other modules.

That's it. One file, well-organized, easy to find what you need.