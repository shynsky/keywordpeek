"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface TrendData {
  year: number;
  month: number;
  volume: number;
}

interface TrendSparklineProps {
  data: TrendData[];
  width?: number;
  height?: number;
  showTrendIndicator?: boolean;
  className?: string;
}

/**
 * Calculate trend direction based on recent vs older data
 */
function calculateTrend(data: TrendData[]): "up" | "down" | "stable" {
  if (data.length < 2) return "stable";

  // Compare average of last 3 months vs first 3 months
  const recent = data.slice(-3);
  const older = data.slice(0, 3);

  const recentAvg =
    recent.reduce((sum, d) => sum + d.volume, 0) / recent.length;
  const olderAvg = older.reduce((sum, d) => sum + d.volume, 0) / older.length;

  const change = ((recentAvg - olderAvg) / (olderAvg || 1)) * 100;

  if (change > 10) return "up";
  if (change < -10) return "down";
  return "stable";
}

export function TrendSparkline({
  data,
  width = 100,
  height = 32,
  showTrendIndicator = true,
  className,
}: TrendSparklineProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className={cn("flex items-center text-muted-foreground", className)}
        style={{ width, height }}
      >
        <span className="text-xs">No data</span>
      </div>
    );
  }

  const trend = calculateTrend(data);
  const volumes = data.map((d) => d.volume);
  const maxVolume = Math.max(...volumes, 1);
  const minVolume = Math.min(...volumes);
  const range = maxVolume - minVolume || 1;

  // Generate SVG path
  const padding = 3;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * chartWidth;
    const y =
      padding + chartHeight - ((d.volume - minVolume) / range) * chartHeight;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;

  // Gradient IDs
  const gradientId = `gradient-${Math.random().toString(36).slice(2)}`;
  const lineGradientId = `line-gradient-${Math.random().toString(36).slice(2)}`;

  // Dynamic colors based on trend
  const colors = {
    up: {
      start: "oklch(0.72 0.2 155)",
      end: "oklch(0.7 0.18 190)",
    },
    down: {
      start: "oklch(0.68 0.22 20)",
      end: "oklch(0.72 0.2 320)",
    },
    stable: {
      start: "oklch(0.72 0.2 320)",
      end: "oklch(0.7 0.18 190)",
    },
  };

  const { start, end } = colors[trend];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width={width}
        height={height}
        className="overflow-visible"
        aria-label="Search volume trend"
      >
        <defs>
          {/* Area gradient */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={start} stopOpacity="0.4" />
            <stop offset="100%" stopColor={end} stopOpacity="0.05" />
          </linearGradient>
          {/* Line gradient */}
          <linearGradient id={lineGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={start} />
            <stop offset="100%" stopColor={end} />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <path
          d={`${pathD} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`}
          fill={`url(#${gradientId})`}
          className="transition-all duration-500"
        />

        {/* Line with gradient */}
        <path
          d={pathD}
          fill="none"
          stroke={`url(#${lineGradientId})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-500"
        />

        {/* End dot with glow */}
        <circle
          cx={width - padding}
          cy={
            padding +
            chartHeight -
            ((volumes[volumes.length - 1] - minVolume) / range) * chartHeight
          }
          r="4"
          fill={end}
          className="animate-pulse-glow"
        />
        <circle
          cx={width - padding}
          cy={
            padding +
            chartHeight -
            ((volumes[volumes.length - 1] - minVolume) / range) * chartHeight
          }
          r="2"
          fill="white"
        />
      </svg>

      {showTrendIndicator && (
        <TrendIndicator trend={trend} size="sm" />
      )}
    </div>
  );
}

/**
 * Simple trend direction indicator
 */
interface TrendIndicatorProps {
  trend: "up" | "down" | "stable";
  size?: "sm" | "md";
  className?: string;
}

export function TrendIndicator({
  trend,
  size = "md",
  className,
}: TrendIndicatorProps) {
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const wrapperSize = size === "sm" ? "p-1" : "p-1.5";

  if (trend === "up") {
    return (
      <div
        className={cn(
          "rounded-lg bg-score-easy/20 text-score-easy transition-all duration-200 hover:scale-110",
          wrapperSize,
          className
        )}
        title="Trending up"
      >
        <TrendingUp className={iconSize} />
      </div>
    );
  }

  if (trend === "down") {
    return (
      <div
        className={cn(
          "rounded-lg bg-score-hard/20 text-score-hard transition-all duration-200 hover:scale-110",
          wrapperSize,
          className
        )}
        title="Trending down"
      >
        <TrendingDown className={iconSize} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg bg-muted text-muted-foreground transition-all duration-200 hover:scale-110",
        wrapperSize,
        className
      )}
      title="Stable"
    >
      <Minus className={iconSize} />
    </div>
  );
}

/**
 * Compact trend display with percentage change
 */
interface TrendChangeProps {
  data: TrendData[];
  className?: string;
}

export function TrendChange({ data, className }: TrendChangeProps) {
  if (data.length < 2) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }

  const recent = data.slice(-3);
  const older = data.slice(0, 3);

  const recentAvg =
    recent.reduce((sum, d) => sum + d.volume, 0) / recent.length;
  const olderAvg = older.reduce((sum, d) => sum + d.volume, 0) / older.length;

  const change = ((recentAvg - olderAvg) / (olderAvg || 1)) * 100;
  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-sm font-bold px-2 py-1 rounded-lg transition-all duration-200 hover:scale-105",
        isPositive && "text-score-easy bg-score-easy/15",
        isNegative && "text-score-hard bg-score-hard/15",
        !isPositive && !isNegative && "text-muted-foreground bg-muted",
        className
      )}
    >
      {isPositive && <TrendingUp className="h-3.5 w-3.5" />}
      {isNegative && <TrendingDown className="h-3.5 w-3.5" />}
      {!isPositive && !isNegative && <Minus className="h-3.5 w-3.5" />}
      <span className="tabular-nums font-mono">
        {isPositive && "+"}
        {change.toFixed(0)}%
      </span>
    </div>
  );
}
