"use client";

import { ExternalLink, TrendingUp, Search, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { CompetitorDomain, CompetitorKeyword } from "@/lib/dataforseo/competitors";

interface CompetitorCardProps {
  competitor: CompetitorDomain;
  rank: number;
  keywords?: CompetitorKeyword[];
  className?: string;
}

export function CompetitorCard({
  competitor,
  rank,
  keywords = [],
  className,
}: CompetitorCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Get rank badge color
  const getRankColor = (r: number) => {
    if (r === 1) return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30";
    if (r === 2) return "bg-gray-400/20 text-gray-600 border-gray-400/30";
    if (r === 3) return "bg-amber-600/20 text-amber-700 border-amber-600/30";
    return "bg-muted text-muted-foreground border-border";
  };

  return (
    <div
      className={cn(
        "rounded-xl border-2 border-border bg-card overflow-hidden transition-all duration-200",
        isExpanded && "shadow-playful",
        className
      )}
    >
      {/* Main content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Rank badge */}
          <div
            className={cn(
              "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
              "text-sm font-bold border-2",
              getRankColor(rank)
            )}
          >
            {rank}
          </div>

          {/* Domain info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-foreground truncate">
                {competitor.domain}
              </h4>
              <a
                href={`https://${competitor.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            {/* Metrics */}
            <div className="flex flex-wrap gap-3 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Search className="h-3.5 w-3.5" />
                <span>
                  <span className="font-medium text-foreground">
                    {formatNumber(competitor.keywordsCount)}
                  </span>{" "}
                  keywords
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>
                  <span className="font-medium text-foreground">
                    {formatNumber(competitor.estimatedTraffic)}
                  </span>{" "}
                  traffic/mo
                </span>
              </div>
              <div className="text-muted-foreground">
                Avg pos:{" "}
                <span className="font-medium text-foreground">
                  {competitor.avgPosition.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Expand button */}
          {keywords.length > 0 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "flex-shrink-0 p-2 rounded-lg transition-colors",
                "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expanded keywords section */}
      {isExpanded && keywords.length > 0 && (
        <div className="border-t border-border/50 bg-muted/30 p-4">
          <h5 className="text-sm font-medium text-muted-foreground mb-3">
            Top Keywords
          </h5>
          <div className="space-y-2">
            {keywords.slice(0, 10).map((kw, index) => (
              <div
                key={kw.keyword}
                className="flex items-center justify-between text-sm"
              >
                <span className="truncate flex-1 mr-4">{kw.keyword}</span>
                <div className="flex items-center gap-3 flex-shrink-0 text-muted-foreground">
                  <span>
                    {formatNumber(kw.searchVolume)}/mo
                  </span>
                  <span
                    className={cn(
                      "w-8 text-right",
                      kw.difficulty < 30
                        ? "text-score-easy"
                        : kw.difficulty < 60
                        ? "text-score-medium"
                        : "text-score-hard"
                    )}
                  >
                    {kw.difficulty}
                  </span>
                  <span className="w-6 text-right text-muted-foreground">
                    #{kw.rankPosition}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {keywords.length > 10 && (
            <p className="text-xs text-muted-foreground mt-3">
              +{keywords.length - 10} more keywords
            </p>
          )}
        </div>
      )}
    </div>
  );
}

interface CompetitorListProps {
  competitors: CompetitorDomain[];
  competitorKeywords?: Array<{
    domain: string;
    keywords: CompetitorKeyword[];
  }>;
  className?: string;
}

export function CompetitorList({
  competitors,
  competitorKeywords = [],
  className,
}: CompetitorListProps) {
  // Create a map of domain -> keywords
  const keywordsByDomain = new Map<string, CompetitorKeyword[]>();
  competitorKeywords.forEach((ck) => {
    keywordsByDomain.set(ck.domain.toLowerCase(), ck.keywords);
  });

  if (competitors.length === 0) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        No competitors found. Try different keywords.
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {competitors.map((competitor, index) => (
        <CompetitorCard
          key={competitor.domain}
          competitor={competitor}
          rank={index + 1}
          keywords={keywordsByDomain.get(competitor.domain.toLowerCase())}
        />
      ))}
    </div>
  );
}
