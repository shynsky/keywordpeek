"use client";

import { cn } from "@/lib/utils";

interface DifficultyBadgeProps {
  difficulty: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  variant?: "badge" | "bar" | "dots";
  className?: string;
}

/**
 * Get difficulty category based on 0-100 score
 * Higher = more difficult
 */
function getDifficultyCategory(difficulty: number): {
  label: string;
  colorClass: string;
  bgClass: string;
} {
  if (difficulty <= 30) {
    return {
      label: "Easy",
      colorClass: "text-score-easy",
      bgClass: "bg-score-easy",
    };
  }
  if (difficulty <= 60) {
    return {
      label: "Medium",
      colorClass: "text-score-medium",
      bgClass: "bg-score-medium",
    };
  }
  return {
    label: "Hard",
    colorClass: "text-score-hard",
    bgClass: "bg-score-hard",
  };
}

export function DifficultyBadge({
  difficulty,
  size = "md",
  showLabel = true,
  variant = "badge",
  className,
}: DifficultyBadgeProps) {
  const { label, colorClass, bgClass } = getDifficultyCategory(difficulty);

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5",
  };

  if (variant === "bar") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[80px]">
          <div
            className={cn("h-full rounded-full transition-all", bgClass)}
            style={{ width: `${difficulty}%` }}
          />
        </div>
        <span className={cn("font-mono text-sm tabular-nums", colorClass)}>
          {difficulty}
        </span>
      </div>
    );
  }

  if (variant === "dots") {
    const filledDots = Math.round(difficulty / 20); // 0-5 dots
    return (
      <div
        className={cn("flex items-center gap-1", className)}
        title={`Difficulty: ${difficulty}/100 (${label})`}
      >
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              i < filledDots ? bgClass : "bg-muted"
            )}
          />
        ))}
        {showLabel && (
          <span className={cn("ml-1 text-xs", colorClass)}>{label}</span>
        )}
      </div>
    );
  }

  // Default badge variant
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border font-medium",
        `${bgClass}/15 border-${bgClass.replace("bg-", "")}/30`,
        colorClass,
        sizeClasses[size],
        className
      )}
      title={`Difficulty: ${difficulty}/100`}
    >
      <span className="font-mono tabular-nums">{difficulty}</span>
      {showLabel && <span className="text-[0.85em] opacity-80">{label}</span>}
    </span>
  );
}

/**
 * Competition badge (low/medium/high)
 */
interface CompetitionBadgeProps {
  competition: "low" | "medium" | "high";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CompetitionBadge({
  competition,
  size = "md",
  className,
}: CompetitionBadgeProps) {
  const config = {
    low: {
      label: "Low",
      colorClass: "text-score-easy",
      bgClass: "bg-score-easy/15 border-score-easy/30",
    },
    medium: {
      label: "Medium",
      colorClass: "text-score-medium",
      bgClass: "bg-score-medium/15 border-score-medium/30",
    },
    high: {
      label: "High",
      colorClass: "text-score-hard",
      bgClass: "bg-score-hard/15 border-score-hard/30",
    },
  };

  const { label, colorClass, bgClass } = config[competition];

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border font-medium",
        bgClass,
        colorClass,
        sizeClasses[size],
        className
      )}
    >
      {label}
    </span>
  );
}
