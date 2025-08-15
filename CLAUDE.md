# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Borrowing Power Calculator - Technical Documentation

## Quick Start

```bash
# Development
npm run dev          # Start Next.js (port 3000)
npx convex dev       # Start Convex backend (separate terminal)

# Production Deployment
npx convex deploy --yes    # Deploy Convex functions
vercel --prod --yes        # Deploy to Vercel
```

## Live URLs
- **Production**: https://moneyheavenclaude.vercel.app
- **Convex Dashboard**: https://dashboard.convex.dev/d/calm-ibis-514

## Browser Tools MCP Setup & Debugging

### Quick Setup
1. **Chrome Extension**: Install BrowserToolsMCP extension v1.2.0+ from GitHub releases
2. **Start Servers**: 
   ```bash
   npx @agentdeskai/browser-tools-server@latest &
   npx @agentdeskai/browser-tools-mcp@latest
   ```
3. **Verify**: Check `/mcp` in Claude Code shows browser-tools server

### Troubleshooting
- **"No server found"**: Kill processes with `pkill -f "browser-tools"` and restart
- **Extension issues**: Verify extension is enabled and DevTools BrowserToolsMCP tab is open
- **Connection test**: `curl -s http://localhost:3025` should return HTML error page

### Configuration
`~/.claude.json`:
```json
{
  "mcpServers": {
    "browser-tools": {
      "command": "npx",
      "args": ["-y", "@agentdeskai/browser-tools-mcp@latest"]
    }
  }
}
```

## Development Workflow Guidelines

### Before Running Commands
- **Always check the current directory** using `pwd` and understand the file structure with `ls` before running commands like `cd` or `npm`
- **Verify package.json scripts** before running npm commands to ensure you're using the correct script names

### Development Servers
- **The Next.js development server** (port 3000) and **Convex backend server** are typically already running in the user's environment
- **Check server status first** before attempting to start them - look for existing processes or port conflicts
- Only restart servers if explicitly requested or if there's evidence they're not running (e.g., connection errors)

## Systematic Bug Investigation Framework

### Agent-Based Debugging Process

When encountering critical bugs, use parallel agents to investigate thoroughly and find root causes rather than surface symptoms.

#### Quick Deploy: Critical Bug Investigation

```typescript
// Template for deploying bug investigation agents
Task({
  subagent_type: "general-purpose",
  description: "Critical bug investigation",
  prompt: `CRITICAL BUG INVESTIGATION: [Bug Description]

Your mission is to investigate [specific issue]. Think hard and be thorough - find the ROOT CAUSE, not just surface issues.

INVESTIGATION STEPS:
1. Search the codebase for all [component/system]-related files
2. Look for [specific patterns/configurations]
3. Check for console errors or warnings related to [area]
4. Examine [specific implementation details]
5. Use context7 to research [framework] best practices
6. Search online for common [issue type] in [tech stack]

DELIVERABLES:
- Exact file paths and line numbers where issues exist
- Root cause analysis (not just symptoms)
- Specific resolution plan with implementation steps
- Best practices recommendations from research
- Any related issues discovered during investigation

Be comprehensive - find the core architectural issue causing [specific impact].`
})
```

#### Proven Investigation Categories

**1. Authentication/Button Functionality Issues**
- **Common Root Cause**: Configuration mismatches (environment variables, OAuth URLs)
- **Investigation Focus**: Convex URL alignment, environment variable consistency
- **Critical Files**: `.env.local`, `layout.tsx`, `AuthButtons.tsx`, OAuth console settings

**2. Theme/Styling Issues**
- **Common Root Cause**: CSS specificity conflicts, hardcoded classes, hydration mismatches
- **Investigation Focus**: CSS rule conflicts, SSR/client hydration differences
- **Critical Files**: `globals.css`, `layout.tsx`, theme components, component styling

**3. State Management Issues**
- **Common Root Cause**: Provider wrapping, context initialization, hydration timing
- **Investigation Focus**: React context setup, Zustand store configuration
- **Critical Files**: Store definitions, provider components, hook implementations

#### Agent Deployment Best Practices

**For Parallel Investigations**:
1. **Launch 3+ agents simultaneously** for complex multi-system issues
2. **Assign specific domains** to each agent (auth, styling, state, etc.)
3. **Require root cause analysis** - not just symptom identification
4. **Demand implementation steps** - specific file paths and code changes
5. **Request best practice research** using context7 and web search

**Agent Prompt Structure**:
```
MISSION: [Clear, specific objective]
INVESTIGATION STEPS: [Numbered checklist]
DELIVERABLES: [Specific outputs required]
CONTEXT: [Any relevant background]
URGENCY: [Impact and user experience implications]
```

#### Verified Resolution Patterns

**Configuration Mismatches** (High Impact):
- Symptoms: Widespread functionality failure, silent errors
- Investigation: Compare documented vs. actual environment variables
- Resolution: Align configuration across all environments
- Prevention: Add startup validation checks

**CSS Conflicts** (Visual/UX Impact):
- Symptoms: Styling not applying, theme switching failures
- Investigation: Check specificity conflicts, hydration differences
- Resolution: Remove conflicting rules, fix SSR/client mismatches
- Prevention: Use design system constraints, avoid arbitrary values

**Authentication Cascade Failures** (Security/Access):
- Symptoms: All protected features non-functional
- Investigation: Trace auth provider setup, token management
- Resolution: Fix provider configuration, validate OAuth setup
- Prevention: Add auth health checks, better error boundaries

#### Emergency Debugging Checklist

When **all buttons/functionality breaks**:
1. ✅ Check environment variable alignment with documentation
2. ✅ Verify authentication provider configuration
3. ✅ Confirm OAuth redirect URLs match exactly
4. ✅ Test basic Convex connection health
5. ✅ Validate no CSS pointer-events blocking interactions

When **themes don't apply**:
1. ✅ Check for hardcoded theme classes in layout
2. ✅ Verify CSS specificity conflicts (html.theme vs .theme)
3. ✅ Confirm hydration protection in theme components
4. ✅ Test localStorage persistence functionality

When **deployment breaks authentication**:
1. ✅ Never use `vercel --prod` (breaks auth URLs)
2. ✅ Ensure CONVEX_DEPLOY_KEY only enabled for Production environment
3. ✅ Verify OAuth redirect URLs match deployment URLs
4. ✅ Check environment variable propagation

#### Documentation Requirements

After each bug investigation:
1. **Update this checklist** with new patterns discovered
2. **Document root causes** in relevant component sections
3. **Add prevention measures** to development guidelines
4. **Create test cases** for critical failure modes

This framework ensures systematic investigation that finds architectural issues causing widespread failures, not just surface-level symptoms.

## High-Level Architecture

### Tech Stack Overview
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **State Management**: Zustand (single store at `/src/store/calculator.ts`)
- **Backend**: Convex (serverless functions with real-time updates)
- **Authentication**: Convex Auth (Google OAuth only)
- **UI Components**: shadcn/ui (copied components, not installed package)
- **Styling**: Tailwind CSS v4 (NO @apply directives, NO arbitrary values)
- **External APIs**: 
  - xAI Grok (property tax exemptions analysis)
  - API Ninjas (ZIP to county/city/state mapping - 50k free requests/month)

### Key Architectural Patterns

1. **Component Structure**:
   - Base UI components: `/src/components/ui/` (from shadcn/ui)
   - Calculator components: `/src/components/calculator/`
   - Maximum 3 levels deep (Page → Section → Component)
   - Single responsibility per component

2. **State Management Flow**:
   - All calculator state in Zustand store
   - Single source of truth: Only store ZIP code, derive location data on-demand
   - DTI calculations trigger automatically on input changes
   - Property tax and insurance fetch location data from ZIP when needed
   - No derived data stored (city/state/county fetched as needed)

3. **Convex Backend**:
   - Schema defined in `/convex/schema.ts`
   - Scenario CRUD operations in `/convex/scenarios.ts`
   - Authentication via Convex Auth with Google OAuth only
   - All queries/mutations filtered by userId
   - **Admin Security**: Admin functions use `internalMutation` with email-based authorization
   - **Pattern**: External HTTP in actions; DB writes in mutations; cron calls internal functions

4. **API Routes**:
   - `/src/app/api/zipcode/route.ts` - ZIP to location lookup via API Ninjas
   - `/src/app/api/property-tax/route.ts` - Property tax calculation with Zod validation
   - Falls back to Zippopotamus if API Ninjas unavailable
   - All routes include timeout handling (5-30s) and proper error responses
   - Input validation using Zod schemas for type safety and security

5. **Type Safety**:
   - Shared types in `/src/types/index.ts`
   - Convex generates types in `/convex/_generated/`
   - Strict TypeScript configuration

### Data Flow Architecture

**ZIP Code as Single Source of Truth**:
- **Store Only**: ZIP code in Zustand store
- **Derive On-Demand**: City, county, state fetched when needed for calculations
- **Benefits**: No stale derived data, simpler state management, cleaner code

**Multi-Layer Cache Strategy**:
- **ZIP → Location**: In-memory cache (1 year/permanent) - ZIP mappings never change
- **Property Tax Rates**: Convex database (12 months) - Updated annually by counties
- **Tax Exemptions**: Convex database (6 months) - Can change with legislation
- **Insurance**: Calculated on-demand with location data

### Critical Implementation Details

1. **FHA Loan Calculations** (`/src/lib/fha-calculator.ts`):
   - DTI can increase from 43% to 56.99% with compensating factors
   - MIP rates vary by LTV ratio
   - Interest rates sourced via Convex `rates` module: primary web scraping (MortgageNewsDaily) with xAI fallback, 24h cache, and error logging

2. **Property Tax System** (`/src/lib/property-tax.ts`):
   - xAI Grok analyzes complex exemptions
   - State-specific rules for TX, GA, CO, etc.
   - 6-month cache for exemption rules, 12-month for rates

3. **Insurance Estimation** (`/src/lib/insurance/`):
   - Enhanced module uses ZIP code for location-based estimates
   - Risk assessment based on county/state factors
   - API Ninjas provides county data for accuracy

4. **DTI Enhancement System** (`/src/lib/dti-factors.ts`):
   - 6 compensating factors, each adds specific DTI percentage
   - Visual progress bar updates in real-time
   - Recommendations generated based on user situation

5. **Hybrid Caching Pattern** (for external API responses):
   - **Problem**: External API calls can't be cached by Convex's automatic query caching
   - **Solution**: Database-backed cache with auto-expiration
   - **Pattern**: Query cache first → On miss, call action → Store results
   - **Implementation**: See `property-tax.ts` and `convex/propertyTax.ts`
   ```typescript
   // Example pattern
   export async function getPropertyTaxRate(location: string) {
     const cached = await convexClient.query(api.propertyTax.getCachedRate, { location })
     if (cached) return cached
     const fresh = await convexClient.action(api.xai.getPropertyTaxRate, { location })
     return fresh // Action stores result for next time
   }
   ```

6. **Critical Business Logic**:
   - **DTI Comparison**: Standard lenders comparison uses 45% DTI, NOT 43%
   - This is intentional for industry standard comparison purposes
   - Located in calculator page ~line 555: `standardAmount={Math.round((results.maxHomePrice || 0) * (45 / (results.debtToIncomeRatio || 50)))}`

### Important Constraints

1. **UI/UX Requirements**:
   - Mobile-first responsive design
   - Labels ABOVE inputs (never placeholders as labels)
   - Optimized input handling for performance
   - Single-column form layouts

2. **Code Style**:
   - NO comments unless explicitly requested
   - Follow existing patterns in codebase
   - Use existing utilities before creating new ones

3. **Security**:
   - API keys stored in environment variables
   - All Convex queries filtered by authenticated userId
   - No client-side API calls to paid services
   - **Admin Authorization Pattern**: Use `internalMutation` with email-based authorization
   ```typescript
   // Example: Admin functions must check email against allowlist
   export const updateRateInDB = internalMutation({
     args: { rate: v.number(), adminEmail: v.string() },
     handler: async (ctx, args) => {
       const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
       if (!adminEmails.includes(args.adminEmail)) {
         throw new ConvexError("Unauthorized: Admin access required");
       }
       // Proceed with admin operation
     }
   });
   ```

## Product Requirements Document (PRD) v2

### Overview
A simple, real-time FHA loan borrowing power calculator that helps users understand their maximum loan amount based on income, credit, location, and compensating factors.

### Core Principles
- **SIMPLICITY FIRST** - Clean UI, minimal steps, no overengineering
- **Real-time updates** - All calculations update instantly
- **Production-ready** - No placeholders or temporary code
- **ACCURACY MATTERS** - Comprehensive calculations provide real value

### Design Philosophy
The following features are intentionally comprehensive to provide accurate, valuable results:

1. **Enhanced Insurance Module** - County-level accuracy using API Ninjas provides users with realistic estimates vs generic state averages. Includes fallback to Zippopotamus for reliability.

2. **Complete DTI Calculations** - All 6 FHA compensating factors are required for competitive borrowing power. Residual income analysis ensures responsible lending recommendations.

3. **AI-Powered Tax Analysis** - xAI Grok provides intelligent exemption analysis that simple lookups cannot match. This catches complex scenarios like senior exemptions, veteran benefits, and state-specific rules.

4. **Comprehensive Coverage** - Supporting all 50 states with specific tax rules and insurance factors provides national utility without complexity - just data-driven accuracy.

These features are implemented with clean, maintainable code that is straightforward to understand and modify. The apparent complexity comes from comprehensive data coverage, not architectural over-abstraction.

### Technical Stack
1. **Frontend**: React 19 + TypeScript
2. **State Management**: Zustand
3. **Backend**: Convex
4. **Authentication**: Convex Auth
5. **Validation**: Zod schemas for API inputs
6. **Styling**: Tailwind CSS v4 with tailwindcss-animate
7. **Build**: Next.js 15 with proper route handler typing
8. **UI Framework**: shadcn/ui components (enhanced)
9. **External APIs**: Groq API with gpt-oss-120b for tax calculations

### UI/UX Design Guidelines

## Modern UI Design System (2025)

### Design Philosophy
- **Linear Design Pattern**: Straightforward, sequential layouts with logical progression
- **Extreme Minimalism**: Remove all unnecessary elements, focus on function
- **Clarity Over Cleverness**: Every element must have a clear purpose
- **Mobile-First**: Design for 360px screens first, enhance for larger devices

### Color Palette Strategy

#### Primary Palette (Neutral Foundation)
```css
/* Base Colors - Use these for 60% of UI */
--slate-50: #f8fafc   /* Backgrounds */
--slate-100: #f1f5f9  /* Card backgrounds */
--slate-200: #e2e8f0  /* Borders */
--slate-300: #cbd5e1  /* Disabled states */
--slate-500: #64748b  /* Secondary text */
--slate-700: #334155  /* Primary text */
--slate-900: #0f172a  /* Headings */

/* Avoid pure white (#fff) and pure black (#000) - use slate-50 and slate-900 instead */
```

#### Accent Colors (10% Usage)
```css
/* Primary Action - Blue */
--blue-500: #3b82f6   /* Primary buttons */
--blue-600: #2563eb   /* Hover states */
--blue-50: #eff6ff    /* Light backgrounds */

/* Success - Green */
--green-500: #10b981  /* Success states */
--green-50: #f0fdf4   /* Success backgrounds */

/* Warning/Highlight - Amber */
--amber-500: #f59e0b  /* Important info */
--amber-50: #fffbeb   /* Warning backgrounds */
```

#### Gradients (Use Sparingly)
```css
/* Subtle gradients for depth - NOT for text */
--gradient-subtle: from-slate-50 to-slate-100
--gradient-accent: from-blue-500 to-blue-600
--gradient-card: from-white to-slate-50/50
```

### Typography System

```css
/* Font Sizes - Mobile First */
--text-xs: 0.75rem    /* 12px - Captions */
--text-sm: 0.875rem   /* 14px - Body small */
--text-base: 1rem     /* 16px - Body default */
--text-lg: 1.125rem   /* 18px - Body large */
--text-xl: 1.25rem    /* 20px - H3 */
--text-2xl: 1.5rem    /* 24px - H2 */
--text-3xl: 1.875rem  /* 30px - H1 */

/* Line Heights */
--leading-tight: 1.25
--leading-normal: 1.5
--leading-relaxed: 1.75

/* Font Weights */
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

### Spacing & Layout

```css
/* Spacing Scale - Use consistently */
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px */
--space-5: 1.25rem   /* 20px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
--space-10: 2.5rem   /* 40px */
--space-12: 3rem     /* 48px */
--space-16: 4rem     /* 64px */
```

### Responsive Breakpoints

```css
/* Mobile First Approach */
/* Base: 320px - 639px (no prefix) */
/* sm: 640px+ (large phones) */
/* md: 768px+ (tablets) */
/* lg: 1024px+ (small laptops) */
/* xl: 1280px+ (laptops) */
/* 2xl: 1536px+ (desktops) */
```

#### Layout Strategy by Device
1. **Mobile (base)**: Single column, full width, collapsible sections
2. **Tablet (md)**: Single column with more padding, some expanded sections
3. **Laptop (xl)**: Two-column layout (40/60 split), all sections expanded

### Component Design Patterns

#### Cards & Containers
```tsx
/* Standard Card */
<Card className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
  /* Subtle shadows, not harsh */
  /* Rounded corners (rounded-xl = 12px) */
  /* Hover effects for interactivity */
</Card>
```

#### Form Design Rules
1. **Step-by-Step Forms**: Break into 3-4 manageable steps with progress indicator
2. **Single Column**: One input per row on mobile, can be two on desktop
3. **Clear Labels**: Always above inputs, never as placeholders
4. **Input Sizing**: Minimum 44px height for touch targets
5. **Validation**: Inline, real-time with clear success/error states
6. **Help Text**: Below inputs, in slate-500 color

#### Button Hierarchy
```tsx
/* Primary - Main CTA */
<Button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium">

/* Secondary - Alternative actions */
<Button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-medium">

/* Ghost - Tertiary actions */
<Button className="hover:bg-slate-100 text-slate-600 px-4 py-2 rounded-lg">
```

### Visual Hierarchy Rules

1. **Z-Index Layers**:
   - Base content: z-0
   - Sticky headers: z-10
   - Dropdowns: z-20
   - Modals: z-30
   - Toasts: z-40

2. **Shadow System**:
   ```css
   --shadow-sm: 0 1px 2px rgba(0,0,0,0.05)
   --shadow-md: 0 4px 6px rgba(0,0,0,0.07)
   --shadow-lg: 0 10px 15px rgba(0,0,0,0.1)
   --shadow-xl: 0 20px 25px rgba(0,0,0,0.1)
   ```

3. **Border Radius**:
   ```css
   --rounded-md: 6px    /* Small elements */
   --rounded-lg: 8px    /* Buttons, inputs */
   --rounded-xl: 12px   /* Cards */
   --rounded-2xl: 16px  /* Large containers */
   ```

### Accessibility Requirements

1. **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
2. **Focus States**: Visible focus rings on all interactive elements
3. **Touch Targets**: Minimum 44x44px on mobile
4. **Screen Readers**: Proper ARIA labels and semantic HTML
5. **Keyboard Navigation**: All features accessible via keyboard

### Animation & Transitions

```css
/* Keep animations subtle and fast */
--transition-fast: 150ms ease
--transition-base: 200ms ease
--transition-slow: 300ms ease

/* Standard transitions */
transition: all 200ms ease;
transition: shadow 200ms ease;
transition: background-color 200ms ease;
```

### Do's and Don'ts

#### DO:
- Use consistent spacing (multiples of 4px/8px)
- Maintain visual hierarchy with size, weight, and color
- Add subtle hover states for desktop
- Use loading states for async operations
- Keep forms short and focused

#### DON'T:
- Use more than 3 primary colors
- Add gradients to text
- Use pure black/white
- Create walls of input fields
- Mix different border radius styles
- Use animations longer than 300ms

### Calculator-Specific Patterns

1. **Result Display**: Large, prominent, always visible
2. **Input Organization**: Group related fields with subtle backgrounds
3. **Progress Indicator**: Linear, shows current step clearly
4. **Comparison Views**: Side-by-side cards for before/after
5. **Data Visualization**: Simple charts, avoid complex graphs

### Component Library Best Practices
1. **shadcn/ui Implementation**:
   - Components are copied and owned by the project
   - Base components in `/components/ui/`
   - Composed components in `/components/calculator/`
   - No modifications to Radix accessibility features

2. **Tailwind CSS Rules**:
   - NO @apply directives
   - NO arbitrary values (e.g., `w-[123px]`)
   - Use design system tokens only
   - Mobile-first approach always
   - Consistent breakpoint usage

3. **Component Hierarchy**:
   - Maximum 3 levels deep (Page → Section → Component)
   - Single responsibility per component
   - No wrapper hell or unnecessary nesting

## Design System Guidelines

### Design Philosophy
- **Financial Trust**: Professional blue dominance, clean data presentation
- **Modern Sophistication**: Glassmorphism effects, intelligent color use
- **Accessibility First**: High contrast, keyboard navigation, progressive disclosure

### Key Design References
1. **Obriy Sarmat**: Dark theme foundation with technical precision
2. **Apollo Studio**: Glassmorphism and advanced visual effects
3. **Signal Website**: Light theme trust and clean professionalism
4. **MOYO Echo Hero**: Bold typography and modern layouts

### Core Principles
- **60% Neutral Foundation**: Professional grays/whites for readability
- **30% Brand Colors**: Trust-building blues and success greens
- **10% Accent Colors**: Strategic vibrant elements for guidance
- **Mobile-First**: Design for 360px screens, enhance for larger devices
- **Component-Based**: Maximum 3 levels deep, single responsibility

### Essential CSS Variables
```css
/* Color System */
--primary: oklch(0.46 0.08 240);     /* Professional blue */
--background: oklch(0.99 0 0);       /* Pure white light theme */
--card: oklch(0.15 0 0);             /* Dark theme cards */

/* Typography */
--text-sm: 0.875rem;   /* Body small */
--text-base: 1rem;     /* Body default */
--text-xl: 1.25rem;    /* H3 */
--text-3xl: 1.875rem;  /* H1 */

/* Spacing (8px base unit) */
--space-4: 1rem;       /* Standard spacing */
--space-6: 1.5rem;     /* Section spacing */
--space-8: 2rem;       /* Large sections */
```

## Feature Implementation Details

### Feature 1: Location, Tax & Rate Calculation

#### Property Tax Calculation

**Data Sources**:
- Primary: xAI Grok for intelligent analysis of complex exemptions
- Fallback: API Ninjas Property Tax API for median rates by ZIP
- **Cache Strategy** (Hybrid Pattern - see convex/CLAUDE.md):
  - **Storage**: Persistent database cache (propertyTaxData table)
  - **Exemption rules**: Cache for 6 months (updated semi-annually)
  - **Tax rates by ZIP**: Cache for 12 months (updated annually)
  - **Pattern**: Query cache first → On miss, call xAI action → Store results
  - **Cleanup**: Daily cron removes expired entries

**Required Functionality**:

1. **ZIP Code → Location Data → Tax Rate Pipeline**:
   - Input: 5-digit ZIP code validation
   - Fetch location data from ZIP (city, county, state) via API Ninjas
   - Build location string with county for accuracy
   - Query Convex cache for property tax data
   - If cache miss: Call xAI with location string for analysis
   - xAI action stores results in database for next query
   - Automatic cleanup of expired entries via daily cron

2. **State-Specific Calculations**:
   - **Texas**: School tax ($100k exemption) + County/City rates + Senior freeze at 65
   - **Georgia**: $2k base + $4k at 65+ (income < $10k) + $10k school exemption at 62+
   - **Colorado**: 50% exemption on first $200k for seniors
   - **General Formula**: `(Assessed Value - Total Exemptions) × Tax Rate`

3. **Display Requirements**:
   - Show headline rate (base rate for area)
   - Show applicable rate (after exemptions)
   - Show annual savings from exemptions
   - Confidence score based on data completeness

#### Mortgage Interest Rate Management

**Implementation**: Primary web scraping (MortgageNewsDaily) with an xAI fallback. Cron triggers an internal action; DB writes and error logs use internal mutations. Rates are cached for 24h and surfaced via a public query and UI warning if stale or a fallback was used. As of 2025‑08‑07, scraping regex updated to match MND's table and xAI fallback upgraded to `grok-4-0709` with a targeted prompt for the “MND's 30 Year FHA (daily survey)” value.

**Technical Approach (Convex pattern)**:
```typescript
// convex/crons.ts
crons.daily("update mortgage rates", { hourUTC: 22, minuteUTC: 0 }, internal.rates.updateRateWithScraping);

// convex/rates.ts (simplified)
export const updateRateWithScraping = internalAction({
  args: {},
  handler: async (ctx) => {
    const scraping = await scrapeMortgageNewsDaily.handler(); // internalAction
    if (scraping.success) {
      await ctx.runMutation(internal.rates.updateRateInDB, { rate: scraping.rate, source: 'mortgagenewsdaily' });
      return { success: true };
    }
    // Log, then fallback to xAI
    await ctx.runMutation(internal.rates.logError, { source: 'mortgagenewsdaily', error: scraping.error ?? 'Unknown', fallbackUsed: true });
    const xai = await fetchRateFromXAI.handler(); // internalAction
    if (xai.success) {
      await ctx.runMutation(internal.rates.updateRateInDB, { rate: xai.rate, source: 'xai' });
      await ctx.runMutation(internal.rates.logError, { source: 'xai', error: 'Fallback used successfully', fallbackUsed: true, finalResult: { success: true, rate: xai.rate, source: 'xai' } });
      return { success: true };
    }
    // Both failed → log final error
    await ctx.runMutation(internal.rates.logError, { source: 'xai', error: xai.error ?? 'Unknown', fallbackUsed: true, finalResult: { success: false } });
    return { success: false };
  }
});

// Public query with 24h staleness check
export const getCurrentFHARate = query({
  args: {},
  handler: async (ctx) => {
    const row = await ctx.db.query('mortgageRates').withIndex('by_type', q => q.eq('rateType', 'fha30')).first();
    if (!row) return { rate: 7.0, source: 'default', lastUpdated: Date.now(), isStale: true };
    const isStale = Date.now() - row.lastUpdated > 24 * 60 * 60 * 1000;
    const wasFallbackUsed = row.source === 'xai' || row.source === 'default';
    return { rate: row.rate, source: row.source, lastUpdated: row.lastUpdated, isStale, wasFallbackUsed };
  }
});
```

**Admin Manual Update Interface**:
- Display MortgageNewsDaily widget for reference
- Manual input form for rate updates
- Audit trail of all rate changes
- Alert system for failed automatic updates

**Rate Display**:
- Show current FHA rate prominently
- Include "Rate as of [date/time]" disclaimer
- Show source and a banner if xAI fallback was used
- Warning if rate is >24 hours old

**Operational Notes (2025-08-07 tests)**:
- Initial run failed (regex miss; xAI 404). We refined selectors and switched model to `grok-4-0709`.
- Current run succeeds: scrape stored 6.12% from MND; fallback action returns 6.125 when called directly.
- Ensure `XAI_API_KEY` present; adjust selectors if MND markup changes.

### Feature 2: Property Insurance (Enhanced)

#### Default Assumptions for Modern Construction
For simplicity and accuracy with our target market (FHA borrowers buying homes), we assume:
- **Year Built**: Current year (new construction)
- **Construction Type**: Frame/wood (standard for modern homes)
- **Distance to Fire Hydrant**: Close (required by building codes)
- **Smoke Detectors**: Present (required by code)

The only user-configurable option is:
- **Security System**: Optional monitored alarm system that provides ~5% discount

These assumptions reflect modern building standards and codes. In future versions, we may add advanced options for older homes or unique construction types, but for our MVP this keeps the UX simple while providing accurate estimates for 95%+ of our users.

#### Implementation Strategy
Enhanced insurance estimation using county-level data, risk assessment, and fallback to state averages.

**Data Sources**:
1. **Primary**: API Ninjas for ZIP → County/City/State mapping (50k free requests/month)
2. **Fallback**: Zippopotamus API (free, no key required, but no county data)
3. **Risk Assessment**: State/county-based risk factors
4. **County Adjustments**: Metropolitan vs rural multipliers
5. **State Averages**: Fallback data stored locally

**Architecture**:
```
src/lib/
├── zip-lookup.ts           # ZIP to location mapping via API Ninjas
├── insurance/
│   ├── insurance-enhanced.ts    # Main estimation logic
│   ├── risk-assessment.ts      # Location-based risk factors
│   ├── county-rates-2025.ts    # County adjustment multipliers
│   └── types.ts               # TypeScript interfaces
```

**ZIP Lookup Integration**:
```typescript
// API Ninjas provides county data (requires API key)
// Fallback to Zippopotamus for basic city/state

export async function getLocationFromZip(zipCode: string): Promise<LocationData | null> {
  // 1. Try API route (uses API Ninjas with key)
  const response = await fetch(`/api/zipcode?zip=${zipCode}`);
  
  // Returns: {
  //   city: string,
  //   state: string,
  //   county: string,  // Available with API Ninjas
  //   lat: number,
  //   lng: number
  // }
}
```

**Risk Assessment Factors**:
```typescript
interface RiskFactors {
  floodZone: boolean;           // FEMA flood zones
  coastalCounty: boolean;       // Hurricane exposure
  wildfireRisk: 'low' | 'medium' | 'high';
  severeWeatherRisk: 'low' | 'medium' | 'high';  // Tornadoes/hail
  earthquakeRisk: 'low' | 'medium' | 'high';
}

// Risk multipliers
const riskMultipliers = {
  floodZone: 1.3,
  coastalCounty: 1.2,
  highWildfire: 1.25,
  highSevereWeather: 1.15,
  highEarthquake: 1.2
};
```

**County Adjustments**:
- Major metros (NYC, LA, Chicago): 1.2-1.35x state average
- Metropolitan areas: 1.1-1.2x
- Suburban areas: 1.0-1.1x
- Rural counties: 0.85-0.95x

**Enhanced Calculation Flow**:
1. User enters ZIP code only (no separate state input)
2. Get location data via API Ninjas (includes county)
3. Calculate base rate from state average
4. Apply county adjustment if county data available
5. Assess risk factors and apply multipliers
6. Apply property-specific adjustments
7. Return estimate with confidence level

**Confidence Levels**:
- **High**: County data + risk assessment available
- **Medium**: ZIP/state data only
- **Low**: National average fallback

**Display Requirements**:
- Show county name if available
- Display risk factors affecting premium
- Confidence level indicator
- Prominent Zebra quote button
- "Estimate only" disclaimer

**Annual Update Process**:
1. Update state averages in insurance.ts
2. Review county adjustments for major changes
3. Update risk zone classifications if needed

### Feature 3: User Authentication & Scenarios

#### Implementation Overview
Simple, secure user authentication with scenario saving using Convex Auth.

**Authentication Flow**:
1. **Landing Page**: Sign In/Up buttons using Convex Auth hooks
2. **Protected Routes**: Calculator requires authentication
3. **User Identity**: Stored as `userId` in all saved data

**Scenario Management**:
```typescript
interface Scenario {
  userId: string;          // From Convex Auth
  name?: string;           // Optional custom name
  inputs: UserInputs;      // All form data
  compensatingFactors: CompensatingFactors;
  results: CalculationResults;
  createdAt: number;       // Timestamp
  lastAccessed?: number;   // For sorting
}
```

**Core Functions** (Already Implemented):
- `create`: Save new scenario with current calculation
- `update`: Modify existing scenario
- `delete`: Remove scenario
- `list`: Get user's scenarios (sorted by date)
- `get`: Load specific scenario

**UI Components**:
1. **Save Button**: In results dashboard
   - Default name: "Scenario - [Date]"
   - Optional: Custom name input
   - Success toast on save

2. **Load Dropdown**: In calculator header
   - Shows recent scenarios (max 10)
   - Display: Name, loan amount, date
   - One-click restore all values

3. **Scenario Manager**: Dedicated page
   - List all saved scenarios
   - Edit names, add notes
   - Delete with confirmation
   - Export to CSV option

**Security**:
- All queries filtered by authenticated userId
- No cross-user data access
- Convex Auth handles OAuth flow
- Session management automatic

### Feature 4: DTI Calculator Logic

#### Overview
Visual DTI enhancement system allowing borrowers to increase their max DTI from 43% to 56.99% through compensating factors.

**Base DTI Rules**:
- **Standard Maximum**: 43% (0.43)
- **With Compensating Factors**: Up to 56.99% (0.5699)
- **Maximum Increase**: 13.99% (0.1399)

**Compensating Factors** (Each adds to max DTI):
```typescript
const COMPENSATING_FACTORS = {
  cashReserves: {
    name: 'Cash Reserves (6+ months)',
    dtiIncrease: 0.03,    // +3%
    requirement: 'reserves >= 6 * monthlyPayment'
  },
  minimalPaymentIncrease: {
    name: 'Minimal Payment Increase',
    dtiIncrease: 0.02,    // +2%
    requirement: 'newPayment <= currentRent * 1.1'
  },
  residualIncome: {
    name: 'Adequate Residual Income',
    dtiIncrease: 0.02,    // +2%
    requirement: 'income - allDebts > familySizeMinimum'
  },
  noDiscretionaryDebt: {
    name: 'No Discretionary Debt',
    dtiIncrease: 0.02,    // +2%
    requirement: 'creditCardDebt < income * 0.02'
  },
  highFICO: {
    name: 'Excellent Credit (740+)',
    dtiIncrease: 0.02,    // +2%
    requirement: 'ficoScore >= 740'
  },
  largeDownPayment: {
    name: 'Large Down Payment (10%+)',
    dtiIncrease: 0.02,    // +2%
    requirement: 'downPaymentPercent >= 10'
  }
};
```

**Visual Progress Bar**:
- Range: 43% → 56.99%
- Color gradient: Orange (43%) → Yellow (50%) → Green (56.99%)
- Shows current DTI with all active factors
- Real-time updates as factors change

**Implementation Logic**:
1. Calculate base DTI from income/debts
2. Check each compensating factor
3. Sum qualifying factors (max 13.99%)
4. Update borrowing power in real-time
5. Show impact on loan amount

**Display Requirements**:
- Progress bar with percentage
- Active factors shown as badges
- DTI breakdown (base + increases)
- Remaining capacity indicator
- Help tooltips for each factor

**Important Rules**:
- Only show factors that actually help (DTI < 56.99%)
- Real-time borrowing power updates
- Clear visual feedback
- Educational tooltips

### Feature 5: Borrowing Power Calculation & Comparison

#### Core FHA Calculation Engine
Comprehensive FHA loan calculations with real-time updates.

**Comparison Strategy**:
- **Baseline**: FHA loan with 45% DTI (standard underwriting)
- **Enhanced**: FHA loan with up to 56.99% DTI (with compensating factors)
- **Value Proposition**: 20-40% increase in purchasing power through:
  - DTI optimization (45% → 56.99%)
  - Location-based shopping (tax & insurance variations)
  - Buydown strategies (future feature)
  - Coaching on cost optimization

**Future Enhancements (v3)**:
1. **Buydown Calculator**:
   - 2-point buydown pricing curves
   - ROI analysis for buydown vs. higher rate
   - Break-even calculations
   - Integration with DTI calculations

2. **Location Intelligence**:
   - Compare purchasing power across ZIP codes
   - Factor in property tax variations
   - Insurance cost differences by county
   - Commute cost analysis

3. **Borrower Coaching**:
   - Fee optimization (pay fees out of pocket)
   - Service provider selection (bulk negotiated rates)
   - Credit improvement strategies
   - Timing optimization for maximum benefit

**Key Parameters**:
```typescript
const FHA_REQUIREMENTS = {
  minFICO: 580,              // For 3.5% down
  minFICOFor10Percent: 500,  // For 10% down
  baseDTIRatio: 0.43,        // Standard max DTI
  maxDTIWithFactors: 0.5699, // With compensating factors
  loanTermYears: 30,         // Standard term
  baseInterestRate: 7.0      // Updated daily from MortgageNewsDaily
};
```

**MIP (Mortgage Insurance Premium) Rates**:
```typescript
// 2024 FHA MIP Structure
const MIP_RATES = {
  upfront: 0.0175,  // 1.75% of loan amount
  
  // Annual rates (paid monthly)
  monthly: {
    ltv95Plus: 0.0055,    // 0.55% for >95% LTV
    ltv90to95: 0.0050,    // 0.50% for 90-95% LTV
    ltv90OrLess: 0.0045   // 0.45% for ≤90% LTV
  }
};
```

**Calculation Flow**:
1. **Max Loan from Income**:
   ```
   Monthly Income × DTI Ratio - Monthly Debts = Max Housing Payment
   Max Housing Payment → Loan Amount (accounting for rate, MIP, taxes)
   ```

2. **Max Loan from Down Payment**:
   ```
   Down Payment Amount ÷ Down Payment % = Max Home Price
   Max Home Price - Down Payment = Max Loan Amount
   ```

3. **Final Max Loan**: Lesser of income-based and down payment-based

4. **PITI Breakdown**:
   - **P**rincipal & Interest (from loan amount and rate)
   - **T**axes (from property tax calculation)
   - **I**nsurance (from insurance estimate)
   - **MIP** (upfront added to loan, monthly added to payment)

**Real-Time Updates**:
- Recalculate on any input change
- Optimized for performance
- Show loading state during calculation
- Display warnings for edge cases

**Display Format**:
```
Max Loan Amount: $425,000
Max Home Price: $440,000
Monthly Payment: $3,250
  - Principal & Interest: $2,835
  - Property Tax: $185
  - Homeowners Insurance: $95
  - MIP: $135
```

### Feature 6: User Workflow

#### Simple 3-Step Flow
Clean, linear progression from landing to results.

**Step 1: Landing Page**
- Hero: "Find Your FHA Borrowing Power in Minutes"
- Three value props with icons:
  - ✓ Real-time calculations
  - ✓ AI-powered tax analysis
  - ✓ Save & compare scenarios
- Single CTA: "Calculate Now" (requires sign in)
- Sign In/Up buttons for new users

**Step 2: Calculator Wizard** (3 screens)
1. **Basic Info**:
   - ZIP code (auto-populates city/state/county)
   - Annual income
   - FICO score (moved from step 2)
   - Progress: ●○○

2. **Monthly Debts**:
   - Monthly debt payments breakdown
   - Current rent (for comparison)
   - Progress: ●●○

3. **Down Payment**:
   - Down payment % slider
   - Shows impact on loan terms
   - Progress: ●●●

4. **Optimize Your DTI** (optional):
   - Compensating factors checklist
   - Real-time borrowing power updates with animations
   - Shows +$X,XXX notifications when factors activate
   - Skip button if not needed
   - Progress: ●●●●

**Step 3: Results Dashboard**
- **Hero Section**: Max loan amount (large, prominent)
- **Three Cards**:
  1. Monthly Payment Breakdown
  2. Property Tax & Insurance
  3. Next Steps
- **Actions**:
  - Save Scenario
  - Adjust Inputs (inline editing)
  - Get Insurance Quote
  - Start Over

**Mobile Experience**:
- Swipe between steps
- Collapsible sections
- Sticky results summary
- Touch-optimized inputs

**User State Persistence**:
- Auto-save progress locally
- Resume abandoned sessions
- Quick access to saved scenarios
- Clear "Start Fresh" option

## API Keys and Configuration

### Environment Variables Required

**IMPORTANT: Never commit API keys to version control. Store them in `.env.local` (development) or your deployment platform's environment variables (production).**

#### Authentication Setup
```bash
# Google OAuth (stored in Convex, not .env files)
npx convex env set AUTH_GOOGLE_ID "your-client-id" --prod
npx convex env set AUTH_GOOGLE_SECRET "your-secret" --prod

# Google OAuth Console Settings:
# Authorized JavaScript Origins:
- http://localhost:3000
- https://moneyheavenclaude.vercel.app

# Authorized Redirect URI (EXACT):
- https://calm-ibis-514.convex.site/api/auth/callback/google
```

#### API Keys (Set in both Convex and Vercel)
```bash
# Convex Environment Variables
npx convex env set XAI_API_KEY "your-key" --prod
npx convex env set GROQ_API_KEY "your-key" --prod

# Vercel Environment Variables (via dashboard)
NEXT_PUBLIC_CONVEX_URL=https://calm-ibis-514.convex.cloud
API_NINJAS_KEY=your-api-ninjas-key
GROQ_API_KEY=your-groq-key
XAI_API_KEY=your-xai-key
```

## Environment Files Structure

- `.env.local` - Development environment (local only)
- `.env.production` - Production values for Vercel reference
- `.env.backup` - Complete backup of all keys (git-ignored)
- `jwt-keys.txt` - JWT keys for Convex Auth (git-ignored)

## Deployment Process

**⚠️ CRITICAL: NEVER use `vercel --prod` - it breaks authentication!**

### Correct Deployment Method:
1. **Test locally**: `npm run dev` + `npx convex dev`
2. **Deploy Convex**: `npx convex deploy --yes`
3. **Deploy Vercel**: 
   - **Preferred**: `git push` (auto-deploys via GitHub)
   - **Alternative**: `vercel` for preview, then promote if needed
4. **Verify**: Check https://moneyheavenclaude.vercel.app

### Why `vercel --prod` Breaks Auth:
- Creates duplicate deployments with different URLs
- Auth callbacks are tied to specific URLs
- Cookie domains get confused between deployments
- Always check existing deployment first with `vercel ls`

### Critical Environment Variable Configuration:
**🚨 CONVEX_DEPLOY_KEY Configuration:**
- Must ONLY be enabled for **Production** environment in Vercel
- ❌ Uncheck Development and Preview  
- ✅ Check Production only
- Failure to configure correctly causes: "Detected a non-production build environment" error

### Google OAuth Setup Requirements:
**Authorized Redirect URI (EXACT):**
- https://calm-ibis-514.convex.site/api/auth/callback/google

### Troubleshooting Commands:
```bash
npx convex logs --prod    # Convex function logs
vercel logs              # Vercel deployment logs
npx convex env list      # View environment variables
```

## Maintenance Notes

- Property tax rates: Update cache annually
- Exemption rules: Update cache semi-annually
- Mortgage rates: Update daily via automated scraper
- Insurance rates: Update annually

## Groq API Integration (Property Tax Analysis)

### Overview
We use Groq's hosted OpenAI gpt-oss-120b model with browser search capabilities for accurate, real-time property tax analysis. This replaces the previous xAI Grok integration.

### Model Details: OpenAI gpt-oss-120b
- **Architecture**: Mixture-of-Experts (MoE) with 20B active parameters and 128 experts
- **Total Parameters**: 120 billion
- **Context Window**: 128K tokens (full support on Groq)
- **Performance**: 500+ tokens/second on GroqCloud
- **License**: Apache 2.0 (open source)
- **Released**: August 5, 2025

### Key Features on Groq Platform
1. **Browser Search**: Built-in capability to search and retrieve current web data
   - Powered by Exa search engine
   - No additional setup required
   - Automatically searches for current tax rates
   - Currently in beta (free during beta period)

2. **Tool Calling**: Server-side tools for autonomous operation
   - Browser search for real-time data
   - Code execution capabilities
   - No tool configuration needed in API calls

3. **Pricing** (as of August 2025):
   - Input: $0.15 per million tokens
   - Output: $0.75 per million tokens
   - Tool calls: Currently free during promotional period

### API Configuration

#### Environment Variable
```bash
# Add to .env.local and Convex environment
GROQ_API_KEY=your-groq-api-key-here
```

#### Model ID
For best results with property tax calculations:
```javascript
model: 'openai/gpt-oss-20b'   // Better structured responses
model: 'openai/gpt-oss-120b'  // Also available but may be slower
```

#### Required Parameters for Browser Search
```javascript
{
  model: 'openai/gpt-oss-120b',
  tool_choice: 'required',      // Must be 'required' for browser search
  tools: [
    { type: 'browser_search' }   // Enable browser search
  ],
  temperature: 0.1,              // Low for factual accuracy
  max_tokens: 2000
}
```

### Implementation Location
- **Convex Action**: `/convex/groq.ts`
- **API Route**: `/src/app/api/property-tax/route.ts`
- **Cache Layer**: Convex database with 12-month cache for rates

### Browser Search Behavior
The model automatically:
1. Searches for current property tax rates when location is provided
2. Looks up specific county/ZIP code tax information
3. Finds applicable exemptions and discounts
4. Returns structured data with confidence scores

### Limitations
- Browser search citations are not currently returned
- Model may occasionally return outdated cached web data
- Falls back to state averages if API fails

### Troubleshooting

#### Common Issues
1. **"Model not found" error**: Ensure using full model ID `openai/gpt-oss-120b`
2. **No search results**: Verify `tool_choice: 'required'` is set
3. **Rate limiting**: Groq has generous limits but may throttle during high usage

#### Testing the Integration
```bash
# Test property tax calculation for Utah
curl -X POST http://localhost:3000/api/property-tax \
  -H "Content-Type: application/json" \
  -d '{
    "state": "UT",
    "zipCode": "84737",
    "county": "Washington County",
    "isPrimaryResidence": true,
    "homeValue": 500000
  }'
```

### Migration from xAI Grok
- Changed model from `grok-beta` to `openai/gpt-oss-120b`
- API endpoint changed from `api.x.ai` to `api.groq.com`
- Added browser search tool configuration
- Improved parsing for more accurate rate extraction
- Enhanced fallback rates for all 50 states