# Next.js App Router Guidelines

Simple rules for our simple app. We have 2 pages and 1 API route. Keep it that way.

## Current Structure (Perfect As Is)
```
/app
├── page.tsx          # Home page (Server Component) ✓
├── calculator/
│   └── page.tsx      # Calculator (Client Component) ✓
├── api/
│   └── census/       # Census API proxy
│       └── route.ts
├── layout.tsx        # Root layout with Convex Auth
└── globals.css       # Global styles
```

## Server vs Client Components

### Use Server Components (default) for:
- Static content (home page)
- SEO-critical pages
- Pages that fetch data directly

### Use Client Components ("use client") for:
- Interactive forms (calculator)
- Pages using browser APIs
- Pages with state management (Zustand)

Current split is CORRECT - don't change it.

## API Routes Pattern

Keep API routes simple like our Census proxy:
```typescript
export async function GET(request: NextRequest) {
  // 1. Validate inputs
  if (!zipCode) {
    return NextResponse.json({ error: 'ZIP code is required' }, { status: 400 });
  }

  // 2. Make external API call
  try {
    const response = await fetch(externalAPI);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## What NOT to Add
- No route groups - we don't need (marketing) or (auth) folders
- No parallel routes - too complex for our needs
- No intercepting routes - unnecessary
- No middleware beyond Convex Auth's - it's already there

## If We Add More Pages

Only add pages for REAL features:
- `/admin` - for mortgage rate updates (Server Component)
- `/compare` - for scenario comparison (Client Component)

Don't add:
- About page - put it on home
- Docs page - external docs site
- Blog - not our job

## Performance Rules

1. **Home page stays server-side** - Fast initial load, good SEO
2. **Calculator stays client-side** - Needs interactivity
3. **Don't split calculator into steps** - Users prefer single page

## CSS Guidelines

Fix the ONE violation in globals.css:
```css
/* BAD - Remove all @apply */
@apply bg-background text-foreground;

/* GOOD - Use direct Tailwind classes */
className="bg-background text-foreground"
```

## Metadata Pattern

Keep it simple:
```typescript
// In layout.tsx or page.tsx
export const metadata = {
  title: 'FHA Borrowing Power Calculator',
  description: 'Calculate your FHA loan eligibility with DTI optimization',
};
```

## Error Handling

Next.js provides error.tsx and loading.tsx - use them ONLY if needed:
- Don't add loading.tsx if page loads fast
- Don't add error.tsx if errors are handled in components

## Environment Variables

For Next.js in this app:
- `NEXT_PUBLIC_*` - For client-side (Convex URL only)
- Others - Server-side only (API keys)

Current setup is correct.

## Testing Approach

For pages in this simple app:
1. Manual testing in dev
2. Basic E2E with Playwright for critical paths
3. Don't unit test pages - test components instead

That's it. This structure serves our users well. Don't complicate it.