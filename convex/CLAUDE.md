# Convex Backend Guidelines

This directory contains our Convex backend - keep it simple, secure, and type-safe.

## Directory Structure
```
/convex
├── _generated/         # Auto-generated Convex files (don't edit)
├── auth.config.js      # Clerk authentication config
├── crons.ts           # Scheduled functions (cache cleanup, etc.)
├── propertyTax.ts     # Property tax cache queries & mutations
├── rates.ts           # Mortgage rate management (scraping + xAI fallback)
├── scenarios.ts       # User scenario CRUD operations
├── schema.ts          # Database schema definitions
├── types.ts           # Shared type definitions
└── xai.ts             # xAI/Groq integrations (property tax)
```

## Core Principles
1. **One table, one purpose**: Each table has a clear, single responsibility
2. **Always authenticate**: Every mutation/query checks user identity (for user data)
3. **Keep it flat**: No complex relationships or joins needed
4. **Type safety**: Use Convex validators, avoid `any`
5. **Follow function roles**: External HTTP in actions; DB writes in mutations; cron calls internal functions

## Pattern to Follow

### 1. Fix Type Duplication
Currently we repeat schema definitions in mutations. Extract shared types:

```typescript
// convex/types.ts - CREATE THIS FILE
import { v } from "convex/values";

export const scenarioInputs = v.object({
  location: v.optional(v.string()),
  income: v.optional(v.number()),
  fico: v.optional(v.number()),
  downPaymentPercent: v.optional(v.number()), // Percentage (3.5 to 20)
  downPayment: v.optional(v.number()), // Legacy field for migration
  monthlyDebts: v.optional(v.number()),
  employmentType: v.optional(v.string()),
  employmentLength: v.optional(v.number()),
  propertyType: v.optional(v.string()),
  loanPurpose: v.optional(v.string()),
});

export const scenarioFactors = v.object({
  reserves: v.optional(v.number()),
  additionalIncome: v.optional(v.number()),
  excellentCreditHistory: v.optional(v.boolean()),
  stableEmployment: v.optional(v.boolean()),
  lowDebtToIncomeRatio: v.optional(v.boolean()),
  significantAssets: v.optional(v.boolean()),
});

export const scenarioResults = v.object({
  maxLoanAmount: v.optional(v.number()),
  maxHomePrice: v.optional(v.number()),
  monthlyPayment: v.optional(v.number()),
  debtToIncomeRatio: v.optional(v.number()),
  loanToValueRatio: v.optional(v.number()),
  interestRate: v.optional(v.number()),
  pmi: v.optional(v.number()),
  recommendations: v.optional(v.array(v.string())),
});
```

Then use in both schema.ts and scenarios.ts to avoid duplication.

### 2. Authentication Pattern
Keep the current pattern - it's perfect:
```typescript
const identity = await ctx.auth.getUserIdentity();
if (!identity) {
  throw new Error("Not authenticated");
}
```

### 3. Data Access Pattern
Always check ownership:
```typescript
const scenario = await ctx.db.get(args.id);
if (!scenario || scenario.userId !== identity.subject) {
  throw new Error("Scenario not found or access denied");
}
```

### 4. Fix the `any` Type
Replace line 105 in scenarios.ts:
```typescript
// BAD
const updateData: any = { updatedAt: Date.now() };

// GOOD - be explicit
const updateData: {
  updatedAt: number;
  inputs?: typeof args.inputs;
  compensatingFactors?: typeof args.compensatingFactors;
  results?: typeof args.results;
  name?: string;
  notes?: string;
} = { updatedAt: Date.now() };
```

## What NOT to Do
- Don't add complex relationships - we don't need them
- Don't call `fetch` from queries/mutations
- Don't schedule public functions - use `internal.*`
- Don't create "service" layers - mutations/queries ARE the service layer
- Don't add pagination - users won't have thousands of scenarios
- Don't optimize prematurely - this is fast enough

## Current Tables
- `scenarios`: User's saved calculations
- `mortgageRates`: Daily FHA rate updates
- `propertyTaxData`: Cached xAI tax analysis responses
- `rateUpdateErrors`: Error logs for rate update attempts

## When to Add More Tables
Only when we have a REAL need:
- If we add user preferences → `userSettings` table
- If we add comparison features → maybe a `comparisons` table
- If we add more external API caches → follow propertyTaxData pattern

## Security Reminders
1. **Never trust client data** - always validate
2. **Always check ownership** - users only see their own data
3. **Use internal mutations** for admin tasks (like updating mortgage rates)

## Testing Convex Functions
Simple approach for our simple app:
```bash
# Trigger mortgage rate update (scrape + xAI fallback)
npx convex run rates:updateRateWithScraping

# Read current FHA rate
npx convex run rates:getCurrentFHARate

# Directly test fallback
npx convex run rates:fetchRateFromXAI
```

## Caching Architecture (Added 2025)

### The Problem
External API calls (like xAI property tax analysis) can't be cached by Convex's automatic query caching because:
- Queries must be deterministic (no external API calls)
- Actions can call APIs but aren't automatically cached
- In-memory caches are lost on server restart

### Our Solution: Hybrid Pattern
Based on Convex best practices and our `rates.ts` pattern, we use:

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Client    │────▶│    Query     │────▶│   Database  │
│             │     │ (Auto-cached)│     │  (propertyTaxData)
└─────────────┘     └──────────────┘     └─────────────┘
                           ↓ (miss)
                    ┌──────────────┐     ┌─────────────┐
                    │    Action    │────▶│  External   │
                    │              │     │  API (xAI)  │
                    └──────────────┘     └─────────────┘
```

### Key Principles
1. **Queries for reading**: Check cached data first (auto-cached by Convex)
2. **Actions for external calls**: Only call when cache miss
3. **Database for persistence**: Store API results with expiration
4. **Separation of concerns**: Read path vs write path

### Implementation Pattern
```typescript
// 1. Client calls query first (fast, cached)
const cached = await ctx.query(api.propertyTax.getCachedData);
if (cached) return cached;

// 2. On cache miss, call action (slow, external API)
const fresh = await ctx.action(api.xai.queryPropertyTax);
return fresh; // Action stores result for next time
```

### Why This Pattern?
- **Follows Convex design**: Queries are pure, actions have side effects
- **Performance**: Leverages automatic query caching
- **Reliability**: Data persists across restarts
- **Simplicity**: Clear separation between read/write paths

Reference: https://docs.convex.dev/functions/query-functions

## Files and Their Responsibilities
- `scenarios.ts`: Save and retrieve user calculations
- `rates.ts`: Manage mortgage interest rates
- `propertyTax.ts`: Cache property tax API responses
- `xai.ts`: External API integration with xAI
- `crons.ts`: Scheduled maintenance tasks

## Recent Changes (2025-08-07)
- Strengthened MND scraping with resilient regex against table content.
- Updated xAI fallback to `grok-4-0709` and tightened prompt to request MND 30 Yr FHA daily survey numeric value only.
- Verified: scrape writes 6.12%; fallback action returns 6.125.

That's it. Keep it simple. Each module does one thing well.