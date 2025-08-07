/**
 * Design System Theme
 * Semantic design tokens for consistent styling across the application
 */

// Semantic Colors
export const colors = {
  // Brand colors
  primary: {
    50: 'hsl(var(--primary-50))',
    100: 'hsl(var(--primary-100))',
    500: 'hsl(var(--primary))',
    600: 'hsl(var(--primary-600))',
    900: 'hsl(var(--primary-900))',
    foreground: 'hsl(var(--primary-foreground))',
  },
  
  // Status colors
  success: {
    50: 'hsl(var(--success-50))',
    100: 'hsl(var(--success-100))',
    500: 'hsl(var(--success))',
    600: 'hsl(var(--success-600))',
    900: 'hsl(var(--success-900))',
    foreground: 'hsl(var(--success-foreground))',
  },
  
  error: {
    50: 'hsl(var(--error-50))',
    100: 'hsl(var(--error-100))',
    500: 'hsl(var(--error))',
    600: 'hsl(var(--error-600))',
    900: 'hsl(var(--error-900))',
    foreground: 'hsl(var(--error-foreground))',
  },
  
  warning: {
    50: 'hsl(var(--warning-50))',
    100: 'hsl(var(--warning-100))',
    500: 'hsl(var(--warning))',
    600: 'hsl(var(--warning-600))',
    900: 'hsl(var(--warning-900))',
    foreground: 'hsl(var(--warning-foreground))',
  },
  
  info: {
    50: 'hsl(var(--info-50))',
    100: 'hsl(var(--info-100))',
    500: 'hsl(var(--info))',
    600: 'hsl(var(--info-600))',
    900: 'hsl(var(--info-900))',
    foreground: 'hsl(var(--info-foreground))',
  },
  
  // Neutral colors (already defined by shadcn)
  secondary: 'hsl(var(--secondary))',
  muted: 'hsl(var(--muted))',
  accent: 'hsl(var(--accent))',
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  card: 'hsl(var(--card))',
  border: 'hsl(var(--border))',
} as const;

// Semantic Spacing (using Tailwind scale)
export const spacing = {
  xs: '0.5rem',    // 8px - space-2
  sm: '0.75rem',   // 12px - space-3
  md: '1rem',      // 16px - space-4
  lg: '1.5rem',    // 24px - space-6
  xl: '2rem',      // 32px - space-8
  '2xl': '3rem',   // 48px - space-12
  '3xl': '4rem',   // 64px - space-16
} as const;

// Border Radius
export const borderRadius = {
  none: '0',
  sm: 'calc(var(--radius) - 4px)',
  md: 'calc(var(--radius) - 2px)', 
  lg: 'var(--radius)',
  xl: 'calc(var(--radius) + 4px)',
  full: '9999px',
} as const;

// Shadows
export const boxShadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
} as const;

// Typography Scale
export const fontSize = {
  xs: ['0.75rem', { lineHeight: '1rem' }],
  sm: ['0.875rem', { lineHeight: '1.25rem' }],
  base: ['1rem', { lineHeight: '1.5rem' }],
  lg: ['1.125rem', { lineHeight: '1.75rem' }],
  xl: ['1.25rem', { lineHeight: '1.75rem' }],
  '2xl': ['1.5rem', { lineHeight: '2rem' }],
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
} as const;

// Font Weights
export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// Breakpoints (Tailwind defaults)
export const screens = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Component-specific variants
export const variants = {
  button: {
    size: {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-6 text-lg',
    },
    variant: {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      success: 'bg-success text-success-foreground hover:bg-success/90',
      error: 'bg-error text-error-foreground hover:bg-error/90',
      warning: 'bg-warning text-warning-foreground hover:bg-warning/90',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    },
  },
  card: {
    variant: {
      default: 'bg-card text-card-foreground',
      outline: 'border bg-card text-card-foreground',
      elevated: 'bg-card text-card-foreground shadow-md',
    },
    padding: {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
  },
} as const;

// Animation durations
export const animation = {
  fast: '150ms',
  normal: '200ms',
  slow: '300ms',
} as const;

// Z-index scale
export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070,
} as const;