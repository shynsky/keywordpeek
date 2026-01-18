import { cn } from "@/lib/utils"

type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right"
type Color = "primary" | "secondary" | "accent"
type Size = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl"

const sizeClasses: Record<Size, string> = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-48 h-48",
  "2xl": "w-64 h-64",
  "3xl": "w-96 h-96",
}

const colorClasses: Record<Color, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  accent: "bg-accent",
}

const positionClasses: Record<Position, string> = {
  "top-left": "top-0 left-0",
  "top-right": "top-0 right-0",
  "bottom-left": "bottom-0 left-0",
  "bottom-right": "bottom-0 right-0",
}

const rotationClasses: Record<Position, string> = {
  "top-left": "rotate-0",
  "top-right": "rotate-90",
  "bottom-right": "rotate-180",
  "bottom-left": "-rotate-90",
}

interface QuarterCircleProps {
  position?: Position
  color?: Color
  size?: Size
  className?: string
  grain?: boolean
}

export function QuarterCircle({
  position = "top-left",
  color = "primary",
  size = "lg",
  className,
  grain = true,
}: QuarterCircleProps) {
  return (
    <div
      className={cn(
        "absolute pointer-events-none overflow-hidden",
        positionClasses[position],
        sizeClasses[size],
        className
      )}
      aria-hidden="true"
    >
      <div
        className={cn(
          "w-[200%] h-[200%] absolute",
          colorClasses[color],
          rotationClasses[position],
          grain && "grain-logo",
          // Position the full circle so only 1/4 is visible
          position === "top-left" && "-top-full -left-full",
          position === "top-right" && "-top-full -right-full",
          position === "bottom-right" && "-bottom-full -right-full",
          position === "bottom-left" && "-bottom-full -left-full"
        )}
        style={{ borderRadius: "50%" }}
      />
    </div>
  )
}

interface CircleProps {
  position?: Position | { top?: string; left?: string; right?: string; bottom?: string }
  color?: Color
  size?: Size
  className?: string
  grain?: boolean
}

export function Circle({
  position = "top-right",
  color = "secondary",
  size = "md",
  className,
  grain = true,
}: CircleProps) {
  const isCustomPosition = typeof position === "object"

  return (
    <div
      className={cn(
        "absolute pointer-events-none",
        sizeClasses[size],
        colorClasses[color],
        !isCustomPosition && positionClasses[position as Position],
        grain && "grain-logo",
        className
      )}
      style={{
        borderRadius: "50%",
        ...(isCustomPosition ? position : {}),
      }}
      aria-hidden="true"
    />
  )
}

interface DecorativeDotsProps {
  className?: string
  color?: Color
  rows?: number
  cols?: number
  gap?: number
}

export function DecorativeDots({
  className,
  color = "primary",
  rows = 3,
  cols = 3,
  gap = 8,
}: DecorativeDotsProps) {
  return (
    <div
      className={cn("absolute pointer-events-none", className)}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 4px)`,
        gridTemplateRows: `repeat(${rows}, 4px)`,
        gap: `${gap}px`,
      }}
      aria-hidden="true"
    >
      {Array.from({ length: rows * cols }).map((_, i) => (
        <div
          key={i}
          className={cn("w-1 h-1", colorClasses[color])}
          style={{ borderRadius: "50%" }}
        />
      ))}
    </div>
  )
}

interface GeometricContainerProps {
  children: React.ReactNode
  className?: string
  decorations?: React.ReactNode
  id?: string
}

export function GeometricContainer({
  children,
  className,
  decorations,
  id,
}: GeometricContainerProps) {
  return (
    <div id={id} className={cn("relative overflow-hidden", className)}>
      {decorations}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

type HalfPosition = "top" | "bottom" | "left" | "right"

const halfPositionClasses: Record<HalfPosition, string> = {
  top: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
  bottom: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
  left: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2",
  right: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2",
}

interface HalfCircleProps {
  position?: HalfPosition
  color?: Color
  size?: Size
  className?: string
  grain?: boolean
}

export function HalfCircle({
  position = "bottom",
  color = "primary",
  size = "xl",
  className,
  grain = true,
}: HalfCircleProps) {
  return (
    <div
      className={cn(
        "absolute pointer-events-none",
        sizeClasses[size],
        colorClasses[color],
        halfPositionClasses[position],
        grain && "grain-logo",
        className
      )}
      style={{ borderRadius: "50%" }}
      aria-hidden="true"
    />
  )
}
