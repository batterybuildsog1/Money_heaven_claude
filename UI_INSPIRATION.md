## Money Heaven — UI Inspiration & Design Direction

### Goals
- Build a clean, finance‑grade UI that feels credible, fast, and human.
- Avoid “AI purple” aesthetics; prefer sophisticated neutrals with restrained accents.
- Offer light and dark themes plus 1 additional style variant. Ensure high contrast and accessibility.
- Prefer prebuilt, well‑maintained components. Go custom only where value is clear.

### Color Direction (no purple)
- Light: warm neutrals on soft gray with oceanic blue accents; subtle greens for success.
- Dark: slate/graphite surfaces with teal/blue accents and muted borders.
- Ocean: deeper blue/teal variant with calm gradients; strong focus and state colors.

Suggested palettes (hex)
- Primary accent: teal/blue — `#0EA5E9` (light), `#0284C7` (dark), `#14B8A6` (alt)
- Success: `#10B981`
- Warning: `#F59E0B`
- Destructive: `#EF4444`
- Neutrals: slate/stone scale from Tailwind (or OKLCH equivalents)

### Typography
- Keep current Geist pairing. Use large numeric displays for key finance values.
- Strong hierarchy: H1 40–56px, H2 28–40px, body 14–16px; dense tables at 13–14px.

### Component & Layout Patterns from Inspiration

1) Calculator UIs
- Large, legible number outputs with subtle animation.
- Stepped wizard with clear progress and primary CTA pinned or easily reachable.
- Inputs inside soft cards with concise helper text and inline validation.

2) CRM/Dashboard systems
- Top header + content grid (bento) of KPIs and trend micro‑charts.
- Filter rail or chips row; secondary actions as icons; primary actions as buttons.
- Cards with calm surfaces, thin borders, and hover elevation.

3) Mobile money/fintech
- Sticky bottom CTA, minimal fields per screen, generous tap targets.
- Clear “success” states with check icons and brief confirmations.

4) Chart bento kits
- KPI tiles with tiny sparklines/area charts, progress rings, and segmented tabs.
- Comparison panels with up/down deltas and compact legends.

### Motion & Feedback
- Micro‑transitions on focus/hover; subtle spring on key numbers.
- Non‑blocking toasts for success and warnings (stale data, fallbacks).
- Skeletons for loading tables/cards; optimistic UI for quick interactions.

### Theming Strategy
- Provide variants via root class: `theme-light`, `theme-dark`, `theme-steel`, `theme-prismatic`.
- Map semantic tokens to OKLCH vars; emphasize readability and contrast.
- Keep theme switcher simple (dropdown) and persist in localStorage.

### Prebuilt Components (preferred)
- Base UI: shadcn/ui + Radix primitives (already in project).
- Charts: Recharts or Tremor for KPI tiles, sparklines, and bar/area charts.
- Tables: shadcn table patterns with sticky headers, column toggles, CSV export.

### Page‑level Patterns to Emulate
- Calculator: 2‑column layout — form wizard (left), contextual insights (right).
- Scenarios (CRM): full‑width data table with sticky header, column toggles; quick actions; compare drawer with KPI tiles + sparkline.
- Dashboard: KPI bento (4–6 tiles) + recent activity + sparkline/area mini chart.
- Admin: compact cards for rate input, status, logs; clear health badges.

### Accessibility & Content Style
- AA contrast minimum; clear focus rings; keyboard navigable controls.
- Concise labels and helper text; avoid jargon; show units and examples.

### References (reviewed)
- Calculator UI Design — Dribbble: [link](https://dribbble.com/shots/26127066-Calculator-UI-Design)
- CRM System Dashboard — Dribbble: [link](https://dribbble.com/shots/26119905-CRM-system-dashboard)
- 3D Calculator UI Design — Dribbble: [link](https://dribbble.com/shots/22168066--3D-Calculator-UI-Design)
- Finko Send Money (mobile) — Dribbble: [link](https://dribbble.com/shots/25293620-Finko-Send-Money)
- Charts UI Kit, Bento Layout — Dribbble: [link](https://dribbble.com/shots/24857032-Charts-UI-Kit-Bento-Layout-Exploration)
- Framer (interaction quality & density): [link](https://www.framer.com/?utm_source=ads&utm_medium=dribbble&utm_campaign=boostedshots)

This document anchors the visual and interaction direction (no purple), informs token choices, and guides component/layout decisions across Calculator, Scenarios, Dashboard, and Admin.


