"use client";

import { FileText, AlertTriangle, ChevronDown, ChevronUp, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { ContentCluster, ContentGap } from "@/lib/openai";

interface ContentClusterCardProps {
  cluster: ContentCluster;
  className?: string;
}

export function ContentClusterCard({ cluster, className }: ContentClusterCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Priority colors
  const priorityConfig = {
    high: {
      bg: "bg-score-easy/15",
      border: "border-score-easy/30",
      text: "text-score-easy",
      label: "High Priority",
    },
    medium: {
      bg: "bg-score-medium/15",
      border: "border-score-medium/30",
      text: "text-score-medium",
      label: "Medium Priority",
    },
    low: {
      bg: "bg-muted",
      border: "border-border",
      text: "text-muted-foreground",
      label: "Low Priority",
    },
  };

  // Content type icons and colors
  const contentTypeConfig: Record<string, { icon: string; color: string }> = {
    Guide: { icon: "Guide", color: "bg-blue-500/15 text-blue-600" },
    Review: { icon: "Review", color: "bg-purple-500/15 text-purple-600" },
    List: { icon: "List", color: "bg-green-500/15 text-green-600" },
    Comparison: { icon: "vs", color: "bg-orange-500/15 text-orange-600" },
    Tutorial: { icon: "Tutorial", color: "bg-cyan-500/15 text-cyan-600" },
    News: { icon: "News", color: "bg-pink-500/15 text-pink-600" },
  };

  const priority = priorityConfig[cluster.priority];
  const contentType = contentTypeConfig[cluster.contentType] || contentTypeConfig.Guide;

  // Format numbers
  const formatNumber = (num: number | undefined): string => {
    if (!num) return "0";
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div
      className={cn(
        "rounded-xl border-2 overflow-hidden transition-all duration-200",
        priority.border,
        isExpanded && "shadow-playful",
        className
      )}
    >
      {/* Header */}
      <div
        className={cn("p-4 cursor-pointer", priority.bg)}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3">
          {/* Content type badge */}
          <div
            className={cn(
              "flex-shrink-0 px-2 py-1 rounded-md text-xs font-medium",
              contentType.color
            )}
          >
            {cluster.contentType}
          </div>

          <div className="flex-1 min-w-0">
            {/* Cluster name */}
            <h4 className="font-bold text-foreground mb-1">{cluster.name}</h4>

            {/* Suggested title */}
            <p className="text-sm text-muted-foreground line-clamp-1">
              {cluster.suggestedTitle}
            </p>

            {/* Main keyword */}
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="px-2 py-0.5 rounded-md bg-primary/15 text-primary font-medium">
                {cluster.mainKeyword}
              </span>
              {cluster.estimatedVolume && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {formatNumber(cluster.estimatedVolume)}/mo
                </span>
              )}
              {cluster.avgDifficulty !== undefined && (
                <span
                  className={cn(
                    "text-sm",
                    cluster.avgDifficulty < 30
                      ? "text-score-easy"
                      : cluster.avgDifficulty < 60
                      ? "text-score-medium"
                      : "text-score-hard"
                  )}
                >
                  Diff: {cluster.avgDifficulty}
                </span>
              )}
            </div>
          </div>

          {/* Priority badge and expand */}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "px-2 py-1 rounded-md text-xs font-medium",
                priority.bg,
                priority.text
              )}
            >
              {priority.label}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="p-4 bg-card border-t border-border/50">
          {cluster.supportingKeywords.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-muted-foreground mb-2">
                Supporting Keywords
              </h5>
              <div className="flex flex-wrap gap-2">
                {cluster.supportingKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="px-2 py-1 rounded-md text-sm bg-muted text-foreground"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ContentGapCardProps {
  gap: ContentGap;
  className?: string;
}

export function ContentGapCard({ gap, className }: ContentGapCardProps) {
  const opportunityConfig = {
    high: {
      bg: "bg-score-easy/15",
      border: "border-score-easy/30",
      text: "text-score-easy",
    },
    medium: {
      bg: "bg-score-medium/15",
      border: "border-score-medium/30",
      text: "text-score-medium",
    },
    low: {
      bg: "bg-muted",
      border: "border-border",
      text: "text-muted-foreground",
    },
  };

  const config = opportunityConfig[gap.opportunity];

  return (
    <div
      className={cn(
        "p-4 rounded-xl border-2",
        config.bg,
        config.border,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className={cn("h-5 w-5 flex-shrink-0", config.text)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-foreground">{gap.keyword}</span>
            <span className="text-sm text-muted-foreground">
              ({gap.searchVolume.toLocaleString()}/mo)
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{gap.suggestedAction}</p>
          {gap.competitorDomain && (
            <p className="text-xs text-muted-foreground mt-1">
              Competitor: {gap.competitorDomain}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface ContentPlanProps {
  clusters: ContentCluster[];
  gaps: ContentGap[];
  className?: string;
}

export function ContentPlan({ clusters, gaps, className }: ContentPlanProps) {
  // Group clusters by priority
  const highPriority = clusters.filter((c) => c.priority === "high");
  const mediumPriority = clusters.filter((c) => c.priority === "medium");
  const lowPriority = clusters.filter((c) => c.priority === "low");

  // Group gaps by opportunity
  const highOpportunityGaps = gaps.filter((g) => g.opportunity === "high");
  const otherGaps = gaps.filter((g) => g.opportunity !== "high");

  return (
    <div className={cn("space-y-6", className)}>
      {/* Content Clusters */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-lg">Content Clusters</h3>
          <span className="text-sm text-muted-foreground">
            ({clusters.length} topics)
          </span>
        </div>

        {highPriority.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-score-easy mb-2">
              High Priority ({highPriority.length})
            </h4>
            <div className="space-y-3">
              {highPriority.map((cluster, i) => (
                <ContentClusterCard key={`high-${i}`} cluster={cluster} />
              ))}
            </div>
          </div>
        )}

        {mediumPriority.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-score-medium mb-2">
              Medium Priority ({mediumPriority.length})
            </h4>
            <div className="space-y-3">
              {mediumPriority.map((cluster, i) => (
                <ContentClusterCard key={`med-${i}`} cluster={cluster} />
              ))}
            </div>
          </div>
        )}

        {lowPriority.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Low Priority ({lowPriority.length})
            </h4>
            <div className="space-y-3">
              {lowPriority.map((cluster, i) => (
                <ContentClusterCard key={`low-${i}`} cluster={cluster} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content Gaps */}
      {gaps.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-score-medium" />
            <h3 className="font-bold text-lg">Content Gaps</h3>
            <span className="text-sm text-muted-foreground">
              (vs competitors)
            </span>
          </div>

          {highOpportunityGaps.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-score-easy mb-2">
                High Opportunity ({highOpportunityGaps.length})
              </h4>
              <div className="space-y-2">
                {highOpportunityGaps.map((gap, i) => (
                  <ContentGapCard key={`high-gap-${i}`} gap={gap} />
                ))}
              </div>
            </div>
          )}

          {otherGaps.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                Other Gaps ({otherGaps.length})
              </h4>
              <div className="space-y-2">
                {otherGaps.slice(0, 5).map((gap, i) => (
                  <ContentGapCard key={`other-gap-${i}`} gap={gap} />
                ))}
              </div>
              {otherGaps.length > 5 && (
                <p className="text-xs text-muted-foreground mt-2">
                  +{otherGaps.length - 5} more gaps
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
