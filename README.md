## Money Heaven — App Overview

Tech: Next.js App Router, TypeScript, Convex, shadcn/ui, Tailwind v4, Zustand.

### Local Development
```bash
npm run dev          # Next.js on http://localhost:3000
npx convex dev       # Convex backend (separate terminal)
```

### Theming
- Theme classes on `<html>`: `theme-light`, `theme-dark`, `theme-steel`, `theme-prismatic`.
- Switcher: `src/components/ThemeSwitcher.tsx` (persists to localStorage).
- Color tokens are OKLCH CSS vars in `src/app/globals.css`.

### Global Feedback & Motion
- Toasts: `ToastProvider` + `useToast` in `src/components/ui/toast.tsx`. Provider mounted in `src/app/layout.tsx`.
- Usage:
```ts
const { success, error, info } = useToast();
success("Saved");
```
- Motion helpers: `.motion-hover` transition class, `.pressable` active scale.

### UI Building Blocks
- UI primitives: `src/components/ui/` (shadcn)
- KPI kit: `src/components/ui/kpi/`
  - `KpiTile.tsx` — label, value, delta, icon
  - `Sparkline.tsx` — tiny line chart
  - `ProgressRing.tsx` — radial progress

### Pages
- `src/app/page.tsx` — Marketing home (steel/prismatic tokens, no purple)
- `src/app/calculator/page.tsx` — FHA calculator (wizard + results, steel tokens)
- `src/app/scenarios/page.tsx` — Saved scenarios list with search/filters and compare (enhancements planned)
- `src/app/dashboard/page.tsx` — User stats (to be upgraded to KPI bento)
- `src/app/admin/page.tsx` — Manual rate update + status

### Data & Services
- Convex functions in `convex/` (rates, scenarios, crons)
- Mortgage rate hook with fallback/stale warnings: `src/hooks/useMortgageRates.ts`
- Scenarios CRUD: `src/hooks/useScenarios.ts`

### Roadmap (UI)
1) Dashboard v2 using KPI bento and sparklines
   - Files: `src/app/dashboard/page.tsx`, `src/components/ui/kpi/*`
   - Deliverables: 4–6 KPI tiles, sparkline of recent scenarios, recent activity list
2) Scenarios CRM table (sticky header, multi-select, compare drawer)
   - Files: `src/app/scenarios/page.tsx`, `src/components/ui/table/*`, `src/components/scenarios/CompareDrawer.tsx`
   - Deliverables: table with filters/sort, side-by-side compare drawer with KPI tiles and sparkline
3) Calculator micro-interactions and inline validation refinements
   - Files: `src/app/calculator/page.tsx`, `src/components/calculator/*`
   - Deliverables: step transitions, input validation hints, animated KPIs

See `UI_INSPIRATION.md` for visual direction and references.

## Phase Plan (Detailed)

### Phase A — Dashboard v2 (KPI Bento)
- Files to edit:
  - `src/app/dashboard/page.tsx` (compose tiles and charts)
  - `src/components/ui/kpi/KpiTile.tsx`, `Sparkline.tsx`, `ProgressRing.tsx` (use)
- Data sources:
  - `useScenarios()` for counts, averages, recent list
- Acceptance:
  - 4–6 tiles responsive >320px, sparkline fed by last N scenarios’ maxLoan

### Phase B — Scenarios CRM Table + Compare Drawer
- Files to edit:
  - `src/app/scenarios/page.tsx`
  - `src/components/scenarios/CompareDrawer.tsx` (new)
  - `src/components/ui/table/*` (light table primitives if needed)
- Acceptance:
  - Sticky header, sort/filter, multi-select actions, side-by-side comparison with KPI tiles and sparkline

### Phase C — Calculator Micro‑interactions
- Files to edit:
  - `src/app/calculator/page.tsx`, `src/components/calculator/*`
- Acceptance:
  - Step slide/fade transitions, inline validation hints, animated KPI updates, standardized toasts
