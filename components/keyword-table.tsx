"use client";

import { useState, useMemo } from "react";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Save,
  ExternalLink,
  MoreHorizontal,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { KeywordScore } from "./keyword-score";
import { DifficultyBadge, CompetitionBadge } from "./difficulty-badge";
import { TrendSparkline } from "./trend-sparkline";

interface TrendData {
  year: number;
  month: number;
  volume: number;
}

export interface KeywordData {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  competition: "low" | "medium" | "high";
  keywordScore: number;
  trend?: TrendData[];
}

type SortField = "keyword" | "searchVolume" | "difficulty" | "cpc" | "keywordScore";
type SortDirection = "asc" | "desc";

interface KeywordTableProps {
  keywords: KeywordData[];
  isLoading?: boolean;
  onSaveKeyword?: (keyword: KeywordData) => void;
  onKeywordClick?: (keyword: string) => void;
  className?: string;
}

export function KeywordTable({
  keywords,
  isLoading = false,
  onSaveKeyword,
  onKeywordClick,
  className,
}: KeywordTableProps) {
  const [sortField, setSortField] = useState<SortField>("keywordScore");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedKeywords = useMemo(() => {
    return [...keywords].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      const aNum = Number(aValue) || 0;
      const bNum = Number(bValue) || 0;

      return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
    });
  }, [keywords, sortField, sortDirection]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground/50" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5" />
    );
  };

  const SortableHeader = ({
    field,
    children,
    className: headerClassName,
  }: {
    field: SortField;
    children: React.ReactNode;
    className?: string;
  }) => (
    <TableHead className={headerClassName}>
      <button
        onClick={() => handleSort(field)}
        className={cn(
          "inline-flex items-center gap-0.5 hover:text-foreground transition-colors",
          sortField === field ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {children}
        <SortIcon field={field} />
      </button>
    </TableHead>
  );

  if (isLoading) {
    return <KeywordTableSkeleton />;
  }

  if (keywords.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
        <div className="text-muted-foreground text-lg mb-2">No keywords yet</div>
        <p className="text-muted-foreground/60 text-sm max-w-md">
          Enter a keyword above to start your research. You can search for multiple keywords at once by separating them with commas.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border bg-card overflow-hidden", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <SortableHeader field="keyword" className="w-[280px]">
              Keyword
            </SortableHeader>
            <SortableHeader field="keywordScore" className="w-[100px]">
              Score
            </SortableHeader>
            <SortableHeader field="searchVolume" className="w-[120px]">
              Volume
            </SortableHeader>
            <SortableHeader field="difficulty" className="w-[120px]">
              Difficulty
            </SortableHeader>
            <TableHead className="w-[100px]">Competition</TableHead>
            <SortableHeader field="cpc" className="w-[100px]">
              CPC
            </SortableHeader>
            <TableHead className="w-[120px]">Trend</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedKeywords.map((keyword, index) => (
            <TableRow
              key={`${keyword.keyword}-${index}`}
              className={cn(
                "group transition-colors",
                onKeywordClick && "cursor-pointer hover:bg-muted/50"
              )}
              onClick={() => onKeywordClick?.(keyword.keyword)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <span className="truncate max-w-[240px]">{keyword.keyword}</span>
                  {onKeywordClick && (
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <KeywordScore score={keyword.keywordScore} size="sm" />
              </TableCell>
              <TableCell>
                <span className="font-mono tabular-nums text-sm">
                  {formatVolume(keyword.searchVolume)}
                </span>
              </TableCell>
              <TableCell>
                <DifficultyBadge
                  difficulty={keyword.difficulty}
                  size="sm"
                  showLabel={false}
                  variant="bar"
                />
              </TableCell>
              <TableCell>
                <CompetitionBadge competition={keyword.competition} size="sm" />
              </TableCell>
              <TableCell>
                <span className="font-mono tabular-nums text-sm">
                  ${keyword.cpc.toFixed(2)}
                </span>
              </TableCell>
              <TableCell>
                {keyword.trend ? (
                  <TrendSparkline
                    data={keyword.trend}
                    width={80}
                    height={24}
                    showTrendIndicator={false}
                  />
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onSaveKeyword && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onSaveKeyword(keyword);
                        }}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save to project
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(
                          `https://www.google.com/search?q=${encodeURIComponent(keyword.keyword)}`,
                          "_blank"
                        );
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Search Google
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * Format volume with K/M suffix
 */
function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  }
  return volume.toString();
}

/**
 * Loading skeleton for keyword table
 */
export function KeywordTableSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="w-[280px]">Keyword</TableHead>
            <TableHead className="w-[100px]">Score</TableHead>
            <TableHead className="w-[120px]">Volume</TableHead>
            <TableHead className="w-[120px]">Difficulty</TableHead>
            <TableHead className="w-[100px]">Competition</TableHead>
            <TableHead className="w-[100px]">CPC</TableHead>
            <TableHead className="w-[120px]">Trend</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-6 w-10 bg-muted rounded animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-12 bg-muted rounded animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-2 w-16 bg-muted rounded-full animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-5 w-14 bg-muted rounded animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-10 bg-muted rounded animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-6 w-20 bg-muted rounded animate-pulse" />
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * Compact keyword list for smaller spaces
 */
interface KeywordListProps {
  keywords: KeywordData[];
  onKeywordClick?: (keyword: string) => void;
  className?: string;
}

export function KeywordList({
  keywords,
  onKeywordClick,
  className,
}: KeywordListProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {keywords.map((keyword, index) => (
        <div
          key={`${keyword.keyword}-${index}`}
          className={cn(
            "flex items-center justify-between p-3 rounded-lg border bg-card",
            "transition-colors",
            onKeywordClick && "cursor-pointer hover:bg-muted/50"
          )}
          onClick={() => onKeywordClick?.(keyword.keyword)}
        >
          <div className="flex items-center gap-3 min-w-0">
            <KeywordScore score={keyword.keywordScore} size="sm" />
            <span className="font-medium truncate">{keyword.keyword}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="font-mono tabular-nums">
              {formatVolume(keyword.searchVolume)}
            </span>
            <DifficultyBadge
              difficulty={keyword.difficulty}
              size="sm"
              showLabel={false}
              variant="dots"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
