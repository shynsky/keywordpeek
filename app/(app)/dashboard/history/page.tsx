"use client";

import { useState, useEffect } from "react";
import {
  History,
  Search,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Coins,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SearchHistoryItem {
  id: string;
  query_keywords: string[];
  results_count: number;
  credits_used: number;
  results: KeywordResult[];
  created_at: string;
}

interface KeywordResult {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  competition: string;
  keywordScore: number;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasMore: false,
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async (offset = 0) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/keywords/history?limit=20&offset=${offset}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch history");
      }

      if (offset === 0) {
        setHistory(data.data);
      } else {
        setHistory((prev) => [...prev, ...data.data]);
      }
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Failed to load search history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/keywords/history?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete");
      }

      setHistory((prev) => prev.filter((h) => h.id !== id));
      toast.success("Search deleted");
    } catch (error) {
      console.error("Error deleting history:", error);
      toast.error("Failed to delete search");
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      const response = await fetch("/api/keywords/history", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to clear history");
      }

      setHistory([]);
      setPagination({ total: 0, limit: 20, offset: 0, hasMore: false });
      setShowClearDialog(false);
      toast.success("Search history cleared");
    } catch (error) {
      console.error("Error clearing history:", error);
      toast.error("Failed to clear history");
    } finally {
      setIsClearing(false);
    }
  };

  const loadMore = () => {
    fetchHistory(pagination.offset + pagination.limit);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  const filteredHistory = history.filter((h) =>
    h.query_keywords.some((kw) =>
      kw.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 30) return "text-score-easy";
    if (difficulty <= 60) return "text-score-medium";
    return "text-score-hard";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">📋</span>
            <h1 className="text-3xl font-bold">Search History</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            View and manage your past keyword searches.
          </p>
        </div>
        {history.length > 0 && (
          <Button
            variant="outline"
            onClick={() => setShowClearDialog(true)}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      {/* Search */}
      {history.length > 0 && (
        <div className="relative max-w-md animate-fade-in-up stagger-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12"
          />
        </div>
      )}

      {/* History list */}
      {isLoading && history.length === 0 ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl border-2 border-border bg-card animate-shimmer"
            />
          ))}
        </div>
      ) : filteredHistory.length > 0 ? (
        <div className="space-y-4 animate-fade-in-up stagger-2">
          {filteredHistory.map((item, i) => (
            <div
              key={item.id}
              className="rounded-2xl border-2 border-border bg-card overflow-hidden transition-all duration-300 hover:border-primary/30"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {/* Header row */}
              <div
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                    <History className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.query_keywords.slice(0, 3).map((kw, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-muted text-sm font-medium truncate max-w-[150px]"
                        >
                          {kw}
                        </span>
                      ))}
                      {item.query_keywords.length > 3 && (
                        <span className="text-sm text-muted-foreground">
                          +{item.query_keywords.length - 3} more
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(item.created_at)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Search className="h-3.5 w-3.5" />
                        {item.results_count} results
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Coins className="h-3.5 w-3.5" />
                        {item.credits_used} credit{item.credits_used !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    disabled={deletingId === item.id}
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                  {expandedId === item.id ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Expanded results */}
              {expandedId === item.id && item.results.length > 0 && (
                <div className="border-t-2 border-border p-4 bg-muted/30">
                  <div className="rounded-xl border-2 border-border overflow-hidden bg-card">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-bold">Keyword</TableHead>
                          <TableHead className="font-bold text-right">Volume</TableHead>
                          <TableHead className="font-bold text-right">Difficulty</TableHead>
                          <TableHead className="font-bold text-right">CPC</TableHead>
                          <TableHead className="font-bold text-right">Score</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {item.results.map((result, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{result.keyword}</TableCell>
                            <TableCell className="text-right">
                              {result.searchVolume?.toLocaleString() || "-"}
                            </TableCell>
                            <TableCell className={cn("text-right font-medium", getDifficultyColor(result.difficulty))}>
                              {result.difficulty ?? "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              {result.cpc ? `$${result.cpc.toFixed(2)}` : "-"}
                            </TableCell>
                            <TableCell className="text-right font-bold text-primary">
                              {result.keywordScore ?? "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Load more button */}
          {pagination.hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                Load more
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 animate-fade-in-up stagger-2">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-primary mb-8 shadow-playful-lg animate-float">
            <History className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3">
            {searchQuery ? "No matches found" : "No search history yet"}
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            {searchQuery
              ? `No searches match "${searchQuery}". Try a different search.`
              : "Your keyword searches will appear here. Start researching to build your history!"}
          </p>
        </div>
      )}

      {/* Clear all dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Clear Search History
            </DialogTitle>
            <DialogDescription>
              This will permanently delete all your search history. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowClearDialog(false)}
              disabled={isClearing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearAll}
              disabled={isClearing}
            >
              {isClearing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Clear All History
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
