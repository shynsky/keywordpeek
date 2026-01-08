"use client";

import { cn } from "@/lib/utils";

interface KeywordScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

/**
 * Get score category and styling based on 0-100 score
 * Higher score = better opportunity
 */
function getScoreCategory(score: number): {
  label: string;
  colorClass: string;
  bgClass: string;
} {
  if (score >= 70) {
    return {
      label: "Great",
      colorClass: "text-score-easy",
      bgClass: "bg-score-easy/15 border-score-easy/30",
    };
  }
  if (score >= 50) {
    return {
      label: "Good",
      colorClass: "text-score-medium",
      bgClass: "bg-score-medium/15 border-score-medium/30",
    };
  }
  if (score >= 30) {
    return {
      label: "Fair",
      colorClass: "text-muted-foreground",
      bgClass: "bg-muted border-border",
    };
  }
  return {
    label: "Low",
    colorClass: "text-score-hard",
    bgClass: "bg-score-hard/15 border-score-hard/30",
  };
}

export function KeywordScore({
  score,
  size = "md",
  showLabel = false,
  className,
}: KeywordScoreProps) {
  const { label, colorClass, bgClass } = getScoreCategory(score);

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5 min-w-[32px]",
    md: "text-sm px-2 py-1 min-w-[40px]",
    lg: "text-base px-3 py-1.5 min-w-[48px]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md border font-mono font-medium tabular-nums",
        bgClass,
        colorClass,
        sizeClasses[size],
        className
      )}
      title={`Keyword Score: ${score}/100 (${label})`}
    >
      <span>{score}</span>
      {showLabel && (
        <span className="text-[0.75em] font-sans opacity-80">{label}</span>
      )}
    </div>
  );
}

/**
 * Circular progress version of the score
 */
interface KeywordScoreCircleProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function KeywordScoreCircle({
  score,
  size = 48,
  strokeWidth = 4,
  className,
}: KeywordScoreCircleProps) {
  const { colorClass } = getScoreCategory(score);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {/* Background circle */}
      <svg className="absolute" width={size} height={size}>
        <circle
          className="text-muted"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>

      {/* Progress circle */}
      <svg
        className={cn("absolute -rotate-90", colorClass)}
        width={size}
        height={size}
      >
        <circle
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className="transition-all duration-500 ease-out"
        />
      </svg>

      {/* Score text */}
      <span className={cn("font-mono font-semibold tabular-nums", colorClass)}>
        {score}
      </span>
    </div>
  );
}
