"use client";

import { useState, useCallback, useEffect } from "react";
import { KeywordSearch } from "@/components/keyword-search";
import { KeywordTable, type KeywordData } from "@/components/keyword-table";
import { CsvExportButton } from "@/components/csv-export-button";
import { BulkSaveButton } from "@/components/save-keyword-button";
import { ProjectSelector, type Project } from "@/components/project-selector";
import { LowCreditWarning } from "@/components/credit-display";
import { createClient } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/types";
import { Sparkles, Target, TrendingUp, Coins, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Fetch credits
        const { data: profile } = await supabase
          .from("profiles")
          .select("credits")
          .eq("id", user.id)
          .single();

        if (profile) {
          setCredits(profile.credits);
        }

        // Fetch projects
        const { data: projectsData } = await supabase
          .from("projects")
          .select("id, name, domain")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (projectsData) {
          setProjects(
            projectsData.map((p) => ({
              id: p.id,
              name: p.name,
              domain: p.domain,
            }))
          );
        }
      }
    };

    fetchData();
  }, []);

  const handleSearch = useCallback(async (searchKeywords: string[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/keywords/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: searchKeywords }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          setError("Insufficient credits. Please purchase more credits to continue.");
        } else {
          setError(data.error || "Failed to search keywords");
        }
        return;
      }

      // Transform API response to KeywordData format
      const keywordData: KeywordData[] = data.keywords.map((kw: {
        keyword: string;
        searchVolume: number;
        difficulty: number;
        cpc: number;
        competition: string;
        keywordScore: number;
        trend?: { year: number; month: number; volume: number }[];
      }) => ({
        keyword: kw.keyword,
        searchVolume: kw.searchVolume,
        difficulty: kw.difficulty,
        cpc: kw.cpc,
        competition: kw.competition as "low" | "medium" | "high",
        keywordScore: kw.keywordScore,
        trend: kw.trend,
      }));

      setKeywords(keywordData);

      // Update credits
      if (data.creditsRemaining !== undefined) {
        setCredits(data.creditsRemaining);
      }
    } catch (err) {
      setError("An error occurred while searching. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreateProject = async (name: string, domain?: string): Promise<Project> => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name,
        domain: domain || null,
      })
      .select("id, name, domain")
      .single();

    if (error) throw error;

    const newProject = {
      id: data.id,
      name: data.name,
      domain: data.domain,
    };

    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  };

  const handleBulkSave = async (keywordsToSave: KeywordData[], projectId: string) => {
    const supabase = createClient();

    const keywordRecords = keywordsToSave.map((kw) => ({
      project_id: projectId,
      keyword: kw.keyword,
      search_volume: kw.searchVolume,
      difficulty: kw.difficulty,
      cpc: kw.cpc,
      keyword_score: kw.keywordScore,
      data: {
        competition: kw.competition,
        trend: kw.trend?.map((t) => ({
          year: t.year,
          month: t.month,
          volume: t.volume,
        })),
      } as Json,
    }));

    const { error } = await supabase.from("keywords").insert(keywordRecords);

    if (error) throw error;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🔍</span>
          <h1 className="text-3xl font-bold">Keyword Research</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Enter keywords to discover search volume, difficulty, and CPC data.
        </p>
      </div>

      {/* Low credit warning */}
      {credits !== null && <LowCreditWarning credits={credits} />}

      {/* Search */}
      <div className="animate-fade-in-up stagger-1">
        <KeywordSearch
          onSearch={handleSearch}
          isLoading={isLoading}
          placeholder="Enter keywords (e.g., seo tools, keyword research, content marketing)"
        />
      </div>

      {/* Error display */}
      {error && (
        <div className="p-5 rounded-2xl bg-destructive/10 border-2 border-destructive/30 text-destructive flex items-start gap-4 animate-bounce-in">
          <div className="p-2 rounded-xl bg-destructive/20">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold">Oops! Something went wrong</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* Results section */}
      {(keywords.length > 0 || isLoading) && (
        <div className="space-y-6 animate-fade-in-up stagger-2">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-muted/50 border-2 border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/15">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold">
                {isLoading ? "Searching..." : `${keywords.length} keywords found`}
              </h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <ProjectSelector
                projects={projects}
                selectedProjectId={selectedProjectId}
                onSelect={setSelectedProjectId}
                onCreate={handleCreateProject}
                placeholder="Select project..."
              />
              <BulkSaveButton
                keywords={keywords}
                projects={projects}
                onSave={handleBulkSave}
              />
              <CsvExportButton keywords={keywords} filename="keyword-research" />
            </div>
          </div>

          {/* Results table */}
          <KeywordTable keywords={keywords} isLoading={isLoading} />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && keywords.length === 0 && (
        <div className="text-center py-20 animate-fade-in-up stagger-2">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-primary mb-8 shadow-playful-lg animate-float">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3">
            Start your research
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto mb-10">
            Enter one or more keywords above to get search volume, difficulty scores,
            and CPC data. Separate multiple keywords with commas.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              {
                emoji: "🎯",
                icon: Target,
                title: "Keyword Score",
                description: "Our 0-100 score helps you quickly identify the best opportunities.",
                color: "bg-primary/15 text-primary border-primary/30",
              },
              {
                emoji: "📈",
                icon: TrendingUp,
                title: "Trend Data",
                description: "See 12-month search trends to spot seasonal patterns.",
                color: "bg-score-easy/15 text-score-easy border-score-easy/30",
              },
              {
                emoji: "💰",
                icon: Coins,
                title: "Pay-as-you-go",
                description: "Only pay for what you use. No monthly subscriptions.",
                color: "bg-accent/20 text-accent-foreground border-accent/40",
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className={cn(
                  "p-6 rounded-2xl bg-card border-2 text-left transition-all duration-300 hover:shadow-playful-lg hover:-translate-y-1 animate-bounce-in",
                )}
                style={{ animationDelay: `${0.3 + i * 0.1}s` }}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl border-2 flex items-center justify-center mb-4",
                    feature.color
                  )}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
