import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3.5 gap-1.5 [&>svg]:pointer-events-none focus-visible:ring-ring focus-visible:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-all duration-200 overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm [a&]:hover:shadow-warm",
        gradient:
          "border-transparent bg-gradient-primary text-white shadow-sm [a&]:hover:shadow-warm",
        secondary:
          "border-border bg-secondary text-secondary-foreground [a&]:hover:border-primary/20 [a&]:hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-white shadow-sm focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border-primary/25 text-foreground bg-transparent [a&]:hover:bg-primary/8 [a&]:hover:border-primary/40",
        accent:
          "border-transparent bg-accent text-accent-foreground shadow-sm",
        sage:
          "border-transparent bg-accent text-accent-foreground shadow-sm",
        success:
          "border-score-easy/25 bg-score-easy/15 text-score-easy",
        warning:
          "border-score-medium/25 bg-score-medium/15 text-score-medium",
        error:
          "border-score-hard/25 bg-score-hard/15 text-score-hard",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
