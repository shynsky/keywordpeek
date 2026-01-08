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
  emoji: string;
  colorClass: string;
  bgClass: string;
  barColor: string;
} {
  if (difficulty <= 30) {
    return {
      label: "Easy",
      emoji: "🟢",
      colorClass: "text-score-easy",
      bgClass: "bg-score-easy",
      barColor: "from-score-easy to-score-easy/70",
    };
  }
  if (difficulty <= 60) {
    return {
      label: "Medium",
      emoji: "🟡",
      colorClass: "text-score-medium",
      bgClass: "bg-score-medium",
      barColor: "from-score-medium to-score-medium/70",
    };
  }
  return {
    label: "Hard",
    emoji: "🔴",
    colorClass: "text-score-hard",
    bgClass: "bg-score-hard",
    barColor: "from-score-hard to-score-hard/70",
  };
}

export function DifficultyBadge({
  difficulty,
  size = "md",
  showLabel = true,
  variant = "badge",
  className,
}: DifficultyBadgeProps) {
  const { label, emoji, colorClass, bgClass, barColor } = getDifficultyCategory(difficulty);

  const sizeClasses = {
    sm: "text-xs px-2 py-1 gap-1",
    md: "text-sm px-2.5 py-1.5 gap-1.5",
    lg: "text-base px-3 py-2 gap-2",
  };

  if (variant === "bar") {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden max-w-[100px] relative">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out-back bg-gradient-to-r",
              barColor
            )}
            style={{ width: `${difficulty}%` }}
          />
          {/* Animated shine effect */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
            style={{ width: `${difficulty}%` }}
          />
        </div>
        <span className={cn("font-mono text-sm font-bold tabular-nums", colorClass)}>
          {difficulty}
        </span>
      </div>
    );
  }

  if (variant === "dots") {
    const filledDots = Math.round(difficulty / 20); // 0-5 dots
    return (
      <div
        className={cn("flex items-center gap-1.5", className)}
        title={`Difficulty: ${difficulty}/100 (${label})`}
      >
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all duration-300",
              i < filledDots ? bgClass : "bg-muted",
              i < filledDots && "animate-pop"
            )}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
        {showLabel && (
          <span className={cn("ml-1.5 text-xs font-semibold", colorClass)}>{label}</span>
        )}
      </div>
    );
  }

  // Default badge variant
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xl border-2 font-semibold transition-all duration-200 hover:scale-105",
        `${bgClass}/20 border-${bgClass.replace("bg-", "")}/40`,
        colorClass,
        sizeClasses[size],
        className
      )}
      title={`Difficulty: ${difficulty}/100`}
    >
      <span className="text-[0.9em]">{emoji}</span>
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
      emoji: "🟢",
      colorClass: "text-score-easy",
      bgClass: "bg-score-easy/20 border-score-easy/40",
    },
    medium: {
      label: "Medium",
      emoji: "🟡",
      colorClass: "text-score-medium",
      bgClass: "bg-score-medium/20 border-score-medium/40",
    },
    high: {
      label: "High",
      emoji: "🔴",
      colorClass: "text-score-hard",
      bgClass: "bg-score-hard/20 border-score-hard/40",
    },
  };

  const { label, emoji, colorClass, bgClass } = config[competition];

  const sizeClasses = {
    sm: "text-xs px-2 py-1 gap-1",
    md: "text-sm px-2.5 py-1.5 gap-1.5",
    lg: "text-base px-3 py-2 gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xl border-2 font-semibold transition-all duration-200 hover:scale-105",
        bgClass,
        colorClass,
        sizeClasses[size],
        className
      )}
    >
      <span className="text-[0.9em]">{emoji}</span>
      {label}
    </span>
  );
}
