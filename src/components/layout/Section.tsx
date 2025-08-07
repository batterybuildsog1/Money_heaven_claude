import * as React from "react"
import { cn } from "@/lib/utils"
import type { Ref } from "react"

interface SectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'ref'> {
  /**
   * The semantic HTML element to render
   * @default "section"
   */
  as?: "section" | "div" | "article" | "aside" | "main"
  
  /**
   * Padding size variant
   * @default "md"
   */
  padding?: "sm" | "md" | "lg"
  
  /**
   * Maximum width constraint
   * @default "7xl"
   */
  maxWidth?: "full" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl"
  
  /**
   * Whether to center the content horizontally
   * @default true
   */
  centered?: boolean
  
  /**
   * Background variant
   * @default "default"
   */
  variant?: "default" | "muted" | "card"
  
  /**
   * React ref for the element
   */
  ref?: Ref<HTMLElement>
}

const sectionVariants = {
  padding: {
    sm: "p-4 sm:p-6",
    md: "p-6 sm:p-8 lg:p-12", 
    lg: "p-8 sm:p-12 lg:p-16",
  },
  maxWidth: {
    full: "max-w-full",
    xs: "max-w-xs",
    sm: "max-w-sm", 
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
  },
  variant: {
    default: "",
    muted: "bg-muted/50",
    card: "bg-card border border-border rounded-lg shadow-sm",
  },
}

function Section({ 
  as: Component = "section",
  padding = "md",
  maxWidth = "7xl", 
  centered = true,
  variant = "default",
  className,
  children,
  ref,
  ...props 
}: SectionProps) {
    return (
      <Component
        ref={ref as any}
        className={cn(
          // Base styles
          "w-full",
          
          // Padding
          sectionVariants.padding[padding],
          
          // Background variant
          sectionVariants.variant[variant],
          
          // Container styles when centered
          centered && [
            "mx-auto",
            sectionVariants.maxWidth[maxWidth],
          ],
          
          // Custom className
          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
}

export { Section, type SectionProps }