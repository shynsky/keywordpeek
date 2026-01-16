"use client";

import { TrendingUp, TrendingDown, Target, AlertCircle, Lightbulb, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ValidationSummary as ValidationSummaryType } from "@/lib/openai";

interface ValidationSummaryProps {
  summary: ValidationSummaryType;
  totalVolume: number;
  avgDifficulty: number;
  keywordCount: number;
  className?: string;
  onFindCompetitors?: () => void;
}

export function ValidationSummary({
  summary,
  totalVolume,
  avgDifficulty,
  keywordCount,
  className,
  onFindCompetitors,
}: ValidationSummaryProps) {
  // Demand level styling
  const demandConfig = {
    excellent: {
      color: "text-score-easy",
      bg: "bg-score-easy/15",
      border: "border-score-easy/30",
      icon: TrendingUp,
      label: "Excellent",
    },
    good: {
      color: "text-primary",
      bg: "bg-primary/15",
      border: "border-primary/30",
      icon: TrendingUp,
      label: "Good",
    },
    moderate: {
      color: "text-score-medium",
      bg: "bg-score-medium/15",
      border: "border-score-medium/30",
      icon: Target,
      label: "Moderate",
    },
    low: {
      color: "text-score-hard",
      bg: "bg-score-hard/15",
      border: "border-score-hard/30",
      icon: TrendingDown,
      label: "Low",
    },
  };

  // Competition level styling
  const competitionConfig = {
    low: {
      color: "text-score-easy",
      bg: "bg-score-easy/15",
      border: "border-score-easy/30",
      label: "Low",
    },
    moderate: {
      color: "text-score-medium",
      bg: "bg-score-medium/15",
      border: "border-score-medium/30",
      label: "Moderate",
    },
    high: {
      color: "text-score-medium",
      bg: "bg-score-medium/15",
      border: "border-score-medium/30",
      label: "High",
    },
    very_high: {
      color: "text-score-hard",
      bg: "bg-score-hard/15",
      border: "border-score-hard/30",
      label: "Very High",
    },
  };

  // Opportunity score color
  const getOpportunityColor = (score: number) => {
    if (score >= 70) return "text-score-easy";
    if (score >= 40) return "text-score-medium";
    return "text-score-hard";
  };

  const demand = demandConfig[summary.demandLevel];
  const competition = competitionConfig[summary.competitionLevel];
  const DemandIcon = demand.icon;

  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-border bg-card overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 bg-muted/30">
        <div className="p-2 rounded-xl bg-primary/15">
          <Target className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-bold text-lg">Market Validation Summary</h3>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
        {/* Demand */}
        <div
          className={cn(
            "p-4 rounded-xl border-2",
            demand.bg,
            demand.border
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <DemandIcon className={cn("h-5 w-5", demand.color)} />
            <span className="text-sm font-medium text-muted-foreground">
              DEMAND
            </span>
          </div>
          <div className={cn("text-2xl font-bold mb-1", demand.color)}>
            {demand.label}
          </div>
          <div className="text-sm text-muted-foreground">
            {totalVolume.toLocaleString()} searches/mo
          </div>
        </div>

        {/* Competition */}
        <div
          className={cn(
            "p-4 rounded-xl border-2",
            competition.bg,
            competition.border
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className={cn("h-5 w-5", competition.color)} />
            <span className="text-sm font-medium text-muted-foreground">
              COMPETITION
            </span>
          </div>
          <div className={cn("text-2xl font-bold mb-1", competition.color)}>
            {competition.label}
          </div>
          <div className="text-sm text-muted-foreground">
            {Math.round(avgDifficulty)} avg difficulty
          </div>
        </div>

        {/* Opportunity Score */}
        <div className="p-4 rounded-xl border-2 bg-card border-border">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              OPPORTUNITY
            </span>
          </div>
          <div
            className={cn(
              "text-3xl font-bold mb-1",
              getOpportunityColor(summary.opportunityScore)
            )}
          >
            {summary.opportunityScore}/100
          </div>
          <div className="text-sm text-muted-foreground">
            {keywordCount} keywords analyzed
          </div>
        </div>
      </div>

      {/* Insight */}
      <div className="px-5 pb-5">
        <div className="p-4 rounded-xl bg-primary/5 border-2 border-primary/20">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-primary/15">
              <Lightbulb className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground mb-1">
                {summary.insight}
              </p>
              <p className="text-sm text-muted-foreground">
                {summary.recommendation}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action */}
      {onFindCompetitors && (
        <div className="px-5 pb-5">
          <button
            onClick={onFindCompetitors}
            className={cn(
              "w-full flex items-center justify-center gap-2 p-3 rounded-xl",
              "bg-primary/10 hover:bg-primary/20 text-primary font-medium",
              "transition-colors duration-200"
            )}
          >
            Find Competitors
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
