# Component Guidelines

Keep components simple, focused, and reusable. We have three types - stick to this pattern.

## Component Structure
```
/components
├── ui/          # Base shadcn/ui components (DON'T MODIFY)
├── calculator/  # Feature-specific components
└── layout/      # Layout components
```

## Rules for Each Type

### 1. UI Components (/ui)
**DO NOT MODIFY THESE** - They're from shadcn/ui
- Copied directly from shadcn/ui
- Provides base functionality
- If you need customization, wrap them in calculator components

### 2. Calculator Components (/calculator)
Pattern to follow:
```typescript
"use client"  // Only if needed for interactivity

import { Button } from "@/components/ui/button"  // Use ui components
import { useCalculatorStore } from "@/store/calculator"  // Connect to store
import { cn } from "@/lib/utils"  // For className merging

interface ComponentNameProps {
  className?: string
  // Other specific props
}

export function ComponentName({ className, ...props }: ComponentNameProps) {
  // Component logic
  return (
    <div className={cn("default-classes", className)}>
      {/* Component JSX */}
    </div>
  )
}
```

### 3. Layout Components (/layout)
Keep these minimal - just structure, no business logic.

## Component Best Practices

### State Management
- **Form inputs**: Use local state with delayed store updates (see IncomeInput.tsx)
- **Display components**: Read directly from store
- **No prop drilling**: Use Zustand store instead

### Styling Rules
- Use Tailwind classes directly
- NO @apply in CSS files
- NO arbitrary values like w-[123px]
- Use cn() utility for conditional classes

### Performance
- Add "use client" ONLY when needed:
  - Using useState, useEffect
  - Handling user interactions
  - Using browser APIs
- Keep server components server-side for better performance

## Pattern Examples

### Input with Delayed Updates
```typescript
// Local state for immediate UI updates
const [value, setValue] = React.useState(initialValue)

// Delayed store update for performance
React.useEffect(() => {
  const timeout = setTimeout(() => {
    updateStore(value)
  }, 300)
  return () => clearTimeout(timeout)
}, [value])
```

### Conditional Styling
```typescript
// Good - using cn()
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  isError && "error-classes",
  className
)}>

// Bad - string concatenation
<div className={`base-classes ${isActive ? 'active-classes' : ''}`}>
```

### Component Composition
```typescript
// Good - compose with UI components
export function SaveButton({ onSave, ...props }) {
  return (
    <Button 
      onClick={onSave}
      variant="primary"
      {...props}
    >
      Save Scenario
    </Button>
  )
}

// Bad - recreating UI component functionality
export function SaveButton({ onSave }) {
  return (
    <button className="px-4 py-2 bg-blue-500...">
      Save Scenario
    </button>
  )
}
```

## What NOT to Do
- Don't create "utils" components - use /lib for utilities
- Don't nest components more than 2 levels deep
- Don't pass the entire store as props - use hooks
- Don't modify /ui components - wrap them instead
- Don't use forwardRef (deprecated in React 19)

## Adding New Components

Before creating a new component, ask:
1. Can I use an existing ui/ component?
2. Can I compose existing components?
3. Is this truly reusable or just used once?

If it's only used once, keep it in the page file.

## Accessibility
- Labels ABOVE inputs (never placeholders as labels)
- Proper ARIA attributes when needed
- Keyboard navigation support
- Error messages linked to inputs

## Testing Components
Focus on:
1. User interactions work correctly
2. Store updates happen as expected
3. Error states display properly
4. Accessibility requirements met

That's it. Keep components simple and focused.