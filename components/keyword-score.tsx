"use client";

import { cn } from "@/lib/utils";

interface KeywordScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  showEmoji?: boolean;
  className?: string;
}

/**
 * Get score category and styling based on 0-100 score
 * Higher score = better opportunity
 */
function getScoreCategory(score: number): {
  label: string;
  emoji: string;
  colorClass: string;
  bgClass: string;
  glowClass: string;
} {
  if (score >= 70) {
    return {
      label: "Great",
      emoji: "🎯",
      colorClass: "text-score-easy",
      bgClass: "bg-score-easy/20 border-score-easy/40",
      glowClass: "shadow-[0_0_12px_oklch(0.72_0.2_155/0.3)]",
    };
  }
  if (score >= 50) {
    return {
      label: "Good",
      emoji: "✨",
      colorClass: "text-score-medium",
      bgClass: "bg-score-medium/20 border-score-medium/40",
      glowClass: "shadow-[0_0_12px_oklch(0.8_0.18_85/0.3)]",
    };
  }
  if (score >= 30) {
    return {
      label: "Fair",
      emoji: "📊",
      colorClass: "text-muted-foreground",
      bgClass: "bg-muted border-border",
      glowClass: "",
    };
  }
  return {
    label: "Low",
    emoji: "🔥",
    colorClass: "text-score-hard",
    bgClass: "bg-score-hard/20 border-score-hard/40",
    glowClass: "",
  };
}

export function KeywordScore({
  score,
  size = "md",
  showLabel = false,
  showEmoji = true,
  className,
}: KeywordScoreProps) {
  const { label, emoji, colorClass, bgClass, glowClass } = getScoreCategory(score);

  const sizeClasses = {
    sm: "text-xs px-2 py-1 min-w-[36px] gap-1",
    md: "text-sm px-2.5 py-1.5 min-w-[44px] gap-1.5",
    lg: "text-base px-3 py-2 min-w-[52px] gap-2",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-xl border-2 font-mono font-bold tabular-nums transition-all duration-200 hover:scale-105",
        bgClass,
        colorClass,
        glowClass,
        sizeClasses[size],
        className
      )}
      title={`Keyword Score: ${score}/100 (${label})`}
    >
      {showEmoji && <span className="not-italic">{emoji}</span>}
      <span>{score}</span>
      {showLabel && (
        <span className="text-[0.8em] font-sans font-medium opacity-80">{label}</span>
      )}
    </div>
  );
}

/**
 * Circular progress version of the score with gradient
 */
interface KeywordScoreCircleProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showEmoji?: boolean;
  className?: string;
}

export function KeywordScoreCircle({
  score,
  size = 56,
  strokeWidth = 5,
  showEmoji = true,
  className,
}: KeywordScoreCircleProps) {
  const { emoji, colorClass, glowClass } = getScoreCategory(score);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  // Gradient ID for unique gradients
  const gradientId = `score-gradient-${score}`;

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center transition-all duration-300 hover:scale-110",
        glowClass,
        className
      )}
      style={{ width: size, height: size }}
    >
      {/* Background circle */}
      <svg className="absolute" width={size} height={size}>
        <circle
          className="text-muted/50"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>

      {/* Progress circle with gradient */}
      <svg
        className="absolute -rotate-90"
        width={size}
        height={size}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.72 0.2 320)" />
            <stop offset="50%" stopColor="oklch(0.7 0.18 190)" />
            <stop offset="100%" stopColor="oklch(0.72 0.2 155)" />
          </linearGradient>
        </defs>
        <circle
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke={`url(#${gradientId})`}
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className="transition-all duration-700 ease-out-back"
        />
      </svg>

      {/* Score text and emoji */}
      <div className="flex flex-col items-center">
        {showEmoji && <span className="text-xs leading-none">{emoji}</span>}
        <span className={cn("font-mono font-bold tabular-nums text-sm", colorClass)}>
          {score}
        </span>
      </div>
    </div>
  );
}
