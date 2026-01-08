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
import { Sparkles } from "lucide-react";

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
      <div>
        <h1 className="text-2xl font-display font-semibold">Keyword Research</h1>
        <p className="text-muted-foreground mt-1">
          Enter keywords to get search volume, difficulty, and CPC data.
        </p>
      </div>

      {/* Low credit warning */}
      {credits !== null && <LowCreditWarning credits={credits} />}

      {/* Search */}
      <KeywordSearch
        onSearch={handleSearch}
        isLoading={isLoading}
        placeholder="Enter keywords (e.g., seo tools, keyword research, content marketing)"
      />

      {/* Error display */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
          {error}
        </div>
      )}

      {/* Results section */}
      {(keywords.length > 0 || isLoading) && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-medium">
                {isLoading ? "Searching..." : `${keywords.length} keywords found`}
              </h2>
            </div>
            <div className="flex items-center gap-2">
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
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 mb-6">
            <Sparkles className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-xl font-display font-semibold mb-2">
            Start your research
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Enter one or more keywords above to get search volume, difficulty scores,
            and CPC data. Separate multiple keywords with commas.
          </p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
            <div className="p-4 rounded-lg bg-card border">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-medium mb-1">Keyword Score</h3>
              <p className="text-sm text-muted-foreground">
                Our 0-100 score helps you quickly identify the best opportunities.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-card border">
              <div className="text-2xl mb-2">📊</div>
              <h3 className="font-medium mb-1">Trend Data</h3>
              <p className="text-sm text-muted-foreground">
                See 12-month search trends to spot seasonal patterns.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-card border">
              <div className="text-2xl mb-2">💰</div>
              <h3 className="font-medium mb-1">Pay-as-you-go</h3>
              <p className="text-sm text-muted-foreground">
                Only pay for what you use. No monthly subscriptions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
