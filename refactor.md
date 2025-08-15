# Application Refactor Plan

## Already Identified Issues (Phase 1-12)

### Phase 1: Next.js 15 Route Handler Fix ✅
- **Issue**: Invalid GET export error in API routes
- **Cause**: Next.js 15 changed params to Promise in route handlers
- **Fix**: Update src/app/api/auth/[...path]/route.ts to await params
- **Status**: To be implemented

### Phase 2: Lint Warnings & Unused Code
- **Issues**:
  - Unused eslint-disable comments in error.tsx, scenarios/page.tsx
  - Unused variables/imports in multiple components
  - Dead catch blocks not using error variable
- **Files Affected**: 
  - src/app/error.tsx
  - src/app/scenarios/page.tsx
  - src/components/calculator/*.tsx
  - src/store/calculator.ts

### Phase 3: Environment & Auth Configuration
- **Issues**: Missing or misconfigured environment variables
- **Required Variables**:
  - NEXT_PUBLIC_CONVEX_URL
  - NEXT_PUBLIC_CONVEX_SITE_URL
  - SITE_URL
  - Auth credentials (Google)
  - API keys (GROQ, API_NINJAS)

### Phase 4: Protected Navigation UX
- **Issue**: Protected links visible when logged out
- **Fix**: Gate navigation links based on auth state
- **File**: src/components/NavBar.tsx

### Phase 5: Duplicate FHA/DTI Computation
- **Issue**: Repeated calculation logic in store
- **Fix**: Extract helper functions for FHA calculations
- **File**: src/store/calculator.ts

### Phase 6: Derived Costs Orchestration
- **Issue**: Tax and insurance calculations not properly sequenced
- **Fix**: Create recalculateDerivedCosts() orchestrator
- **Files**: src/store/calculator.ts, src/app/calculator/page.tsx

### Phase 7: API Routes Hardening
- **Issues**: 
  - Missing error handling
  - No timeouts
  - No caching headers
- **Files**: src/app/api/property-tax/route.ts, src/app/api/zipcode/route.ts

### Phase 8: Accessibility & UX
- **Issues**:
  - Missing ARIA attributes
  - Undefined CSS animations
  - Prop mismatches
- **Files**: src/components/scenarios/CompareDrawer.tsx

### Phase 9: Dead Code Removal
- **Potential Dead Files**:
  - src/components/calculator/CalculatorForm.tsx
  - src/lib/property-tax-hybrid.ts
  - src/components/calculator/ResultsDashboard.tsx

### Phase 10: Admin Authorization
- **Issue**: Admin mutations not protected
- **Fix**: Add authorization checks in Convex
- **File**: convex/rates.ts

### Phase 11: CI/CD Setup
- **Missing**: Build checks, tests, smoke tests

### Phase 12: Production Verification
- **Tasks**: Full end-to-end testing after deployment

---

## Agent Investigation Areas

### Planned Investigation Sections:
1. **Authentication & Middleware** - Auth flow, JWT handling, middleware logic
2. **State Management** - Zustand store architecture, derived state, performance
3. **UI Components** - Component hierarchy, shadcn usage, Tailwind patterns
4. **API Integration** - Route handlers, external APIs, error handling
5. **Convex Backend** - Schema design, queries/mutations, caching strategy
6. **Calculation Logic** - FHA/DTI/Tax/Insurance calculations, data flow
7. **Build & Dependencies** - Package versions, unused deps, build optimization
8. **Type Safety** - TypeScript usage, type generation, any types

---

## Investigation Findings

### 1. Authentication & Middleware (VALIDATED ✅)

#### HIGH PRIORITY Issues:
- **Redundant Auth State Logic** (CORRECT)
  - Multiple different patterns for checking auth across components
  - Solution: Standardize on `useConvexAuth()` hook everywhere
  
- **Unnecessary Route Proxy** (NEEDS REVIEW ⚠️)
  - The proxy in `/api/auth/[...path]/route.ts` may actually be needed for Convex Auth
  - Verify with Convex docs before removing

- **Missing Security Headers** (CORRECT)
  - No CSRF protection or security headers in middleware
  - Solution: Add standard security headers

#### MEDIUM PRIORITY:
- **Inconsistent Loading States** (CORRECT)
- **Overly Broad Middleware Matcher** (CORRECT)

### 2. State Management - Zustand (VALIDATED ✅)

#### CRITICAL Issues:
- **Massive Code Duplication** (CORRECT - HIGHEST PRIORITY)
  - 271 lines of duplicate code between `calculateFHABorrowingPowerSilent` and `calculateFHABorrowingPower`
  - Solution: Extract shared logic immediately
  
- **DOM Event Dispatching in Store** (CORRECT)
  - Store should not directly manipulate DOM
  - Solution: Use proper pub-sub pattern

#### HIGH PRIORITY:
- **Circular Dependencies in State Updates** (CORRECT)
- **Debounced Function Outside Store** (CORRECT)
- **No Error Boundaries for Async Actions** (CORRECT)

### 3. UI Components (VALIDATED ✅)

#### HIGH PRIORITY Issues:
- **Component Redundancy** (CORRECT)
  - Three different Progress components doing same thing
  - Solution: Consolidate to single shadcn Progress component
  
- **Tailwind Arbitrary Values** (CORRECT - VIOLATES CLAUDE.md)
  - Multiple violations of no arbitrary values rule
  - Solution: Replace with design tokens

#### MEDIUM PRIORITY:
- **Component Hierarchy Too Deep** (CORRECT)
- **Missing Accessibility Attributes** (CORRECT)

### 4. API Routes (VALIDATED ✅)

#### CRITICAL Issues:
- **No Timeout Handling** (CORRECT - HIGHEST PRIORITY)
  - External API calls can hang indefinitely
  - Solution: Add `AbortSignal.timeout()` to all fetch calls
  
- **No Input Validation** (CORRECT)
  - Missing Zod validation on POST endpoints
  - Solution: Add schema validation

#### HIGH PRIORITY:
- **No Rate Limiting** (CORRECT)
- **Missing Route Segment Config** (CORRECT)

### 5. Convex Backend (VALIDATED ✅)

#### HIGH PRIORITY Issues:
- **Admin Functions Not Protected** (CORRECT - SECURITY ISSUE)
  - `updateRate` should be internal mutation with auth
  - Solution: Convert to `internalMutation` immediately
  
- **Inefficient Cache Cleanup** (CORRECT)
  - Full table scans in cleanup cron
  - Solution: Use indexed queries with batching

#### MEDIUM PRIORITY:
- **Missing Compound Indexes** (CORRECT)
- **No ZIP Code Caching** (CORRECT)

### 6. Calculation Logic (VALIDATED ✅)

#### ACCURACY Issues:
- **MIP Rate Logic Error** (NEEDS VERIFICATION ⚠️)
  - Agent claims rates are incorrect, but code shows 0.55% which matches HUD
  - Need to verify against official HUD rates
  
- **DTI Max Calculation** (INCORRECT ❌)
  - Agent misunderstood - code correctly allows 56.99%
  - No fix needed

#### PERFORMANCE:
- **Duplicate Calculation Functions** (CORRECT - SAME AS ZUSTAND ISSUE)
- **No Memoization for DTI Sensitivity** (CORRECT)

### 7. Build & Dependencies (VALIDATED ✅)

#### CRITICAL Issues:
- **Missing Required Dependency** (CORRECT - BUILD BLOCKER)
  - `tailwindcss-animate` referenced but not installed
  - Solution: `npm install tailwindcss-animate`
  
- **ESLint Disabled** (CORRECT)
  - `ignoreDuringBuilds: true` bypasses type safety
  - Solution: Fix errors and re-enable

#### HIGH PRIORITY:
- **Outdated PostCSS** (CORRECT - SECURITY)
- **Unused Dependencies** (CORRECT)
  - `zip-state`, `autoprefixer`, `tw-animate-css`

### 8. Type Safety (VALIDATED ✅)

#### HIGH PRIORITY Issues:
- **Excessive `any` Types** (CORRECT)
  - Scenarios page has 12+ uses of `any`
  - Solution: Use proper Scenario types
  
- **Dead Components** (CORRECT)
  - ThemeSwitcher, ProgressRing, ProgressBar unused
  - Solution: Delete files

---

## Priority Action Plan

### IMMEDIATE (Fix Today):
1. ✅ Fix Next.js 15 route params (Phase 1)
2. 🔴 Install missing `tailwindcss-animate` dependency
3. 🔴 Add timeout handling to all API routes
4. 🔴 Protect admin mutations in Convex

### HIGH PRIORITY (This Week):
1. 🔴 Extract duplicate FHA calculation logic (271 lines!)
2. 🔴 Replace all `any` types in scenarios page
3. 🔴 Add input validation to API routes
4. 🔴 Consolidate Progress components
5. 🔴 Remove unused dependencies

### MEDIUM PRIORITY (Next Sprint):
1. 🟡 Standardize auth pattern with `useConvexAuth()`
2. 🟡 Add security headers to middleware
3. 🟡 Fix Tailwind arbitrary values
4. 🟡 Optimize Convex cache cleanup
5. 🟡 Add rate limiting to APIs

### LOW PRIORITY (Backlog):
1. 🟢 Remove dead code and components
2. 🟢 Add compound indexes to Convex
3. 🟢 Implement ZIP code caching
4. 🟢 Update TypeScript target to ES2022

---

## Validation Notes

### Correctly Identified Issues (90%):
- Most issues are valid and well-documented
- Solutions are appropriate and follow best practices

### False Positives (10%):
- DTI max calculation is actually correct
- Auth proxy removal needs verification
- MIP rates need official HUD verification

### Most Critical Finding:
**The 271-line code duplication in Zustand store is the most severe issue** - it affects maintainability, testing, and introduces risk of divergent behavior.