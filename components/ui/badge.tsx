import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center border-2 px-3 py-1 text-xs font-bold uppercase tracking-wide w-fit whitespace-nowrap shrink-0 [&>svg]:size-3.5 gap-1.5 [&>svg]:pointer-events-none focus-visible:ring-2 focus-visible:ring-primary overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary text-primary-foreground",
        secondary:
          "border-border bg-secondary text-secondary-foreground [a&]:hover:border-foreground",
        destructive:
          "border-destructive bg-destructive text-white",
        outline:
          "border-foreground text-foreground bg-transparent [a&]:hover:bg-foreground [a&]:hover:text-background",
        accent:
          "border-accent bg-accent text-accent-foreground",
        success:
          "border-score-easy bg-score-easy/15 text-score-easy",
        warning:
          "border-score-medium bg-score-medium/15 text-score-medium",
        error:
          "border-score-hard bg-score-hard/15 text-score-hard",
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
