"use client";

import { useState, useCallback, useEffect } from "react";
import { Sparkles, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LowCreditWarning } from "@/components/credit-display";
import { useCredits } from "@/lib/credits-context";
import { useOnboarding } from "@/components/onboarding";
import { KeywordTable, type KeywordData } from "@/components/keyword-table";
import {
  ResearchInput,
  ValidationSummary,
  CompetitorList,
  ContentPlan,
  ResearchTabs,
  TabContent,
  RecentSessions,
  SessionHeader,
  type ResearchTab,
  type ResearchSubmitParams,
} from "@/components/research";
import type { ResearchSession } from "@/lib/research/sessions";
import type { ValidationSummary as ValidationSummaryType } from "@/lib/openai";
import type { CompetitorDomain, CompetitorKeyword } from "@/lib/dataforseo/competitors";
import type { ContentCluster, ContentGap } from "@/lib/openai";

export default function DashboardPage() {
  // Credits from context
  const { credits, refreshCredits } = useCredits();

  // Onboarding context
  const { incrementSearchCount } = useOnboarding();

  // UI State
  const [error, setError] = useState<string | null>(null);

  // Session state
  const [currentSession, setCurrentSession] = useState<ResearchSession | null>(null);
  const [recentSessions, setRecentSessions] = useState<ResearchSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  // Tab state
  const [activeTab, setActiveTab] = useState<ResearchTab>("validation");
  const [completedTabs, setCompletedTabs] = useState<ResearchTab[]>([]);
  const [loadingTab, setLoadingTab] = useState<ResearchTab | null>(null);

  // Tab 1: Validation data
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [validationSummary, setValidationSummary] = useState<ValidationSummaryType | null>(null);

  // Tab 2: Competitor data
  const [competitors, setCompetitors] = useState<CompetitorDomain[]>([]);
  const [competitorKeywords, setCompetitorKeywords] = useState<Array<{
    domain: string;
    keywords: CompetitorKeyword[];
  }>>([]);

  // Tab 3: Content plan data
  const [contentClusters, setContentClusters] = useState<ContentCluster[]>([]);
  const [contentGaps, setContentGaps] = useState<ContentGap[]>([]);

  // Fetch initial data
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch("/api/research/sessions?limit=6");
        if (response.ok) {
          const data = await response.json();
          setRecentSessions(data.data || []);
        }
      } catch {
        console.error("Failed to fetch sessions");
      }
      setIsLoadingSessions(false);
    };

    fetchSessions();
  }, []);

  // Handle research generation (Tab 1)
  const handleGenerate = useCallback(
    async (params: ResearchSubmitParams) => {
      setError(null);
      setLoadingTab("validation");

      try {
        const response = await fetch("/api/research/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: params.mode === "ai" ? params.description : undefined,
            keywords: params.mode === "manual" ? params.keywords : undefined,
            locationCode: params.locationCode,
            languageCode: params.languageCode,
            sessionId: currentSession?.id,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 402) {
            setError("Insufficient credits. Please purchase more credits to continue.");
          } else {
            setError(data.error || "Failed to generate keywords");
          }
          return;
        }

        // Transform keywords to KeywordData format
        const keywordData: KeywordData[] = data.data.keywords.map(
          (kw: {
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
          })
        );

        setKeywords(keywordData);
        setValidationSummary(data.data.validationSummary);

        // Set session if new
        if (!currentSession) {
          // Fetch the full session
          const sessionResponse = await fetch(
            `/api/research/sessions/${data.data.sessionId}`
          );
          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            setCurrentSession(sessionData.data);
          }
        }

        // Mark validation as completed
        setCompletedTabs(["validation"]);

        // Update credits via context
        if (data.creditsRemaining !== undefined) {
          refreshCredits();
        }

        // Show success toast
        toast.success(`Generated ${keywordData.length} keywords`);

        // Track search for onboarding
        incrementSearchCount();
      } catch (err) {
        setError("An error occurred. Please try again.");
        console.error(err);
      } finally {
        setLoadingTab(null);
      }
    },
    [currentSession, refreshCredits, incrementSearchCount]
  );

  // Handle competitor discovery (Tab 2)
  const handleFindCompetitors = useCallback(async () => {
    if (!currentSession) return;

    setError(null);
    setLoadingTab("competitors");
    setActiveTab("competitors");

    try {
      const response = await fetch("/api/research/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSession.id,
          serpKeywordCount: 5,
          competitorLimit: 5,
          fetchCompetitorKeywords: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          setError("Insufficient credits. Please purchase more credits to continue.");
        } else {
          setError(data.error || "Failed to discover competitors");
        }
        return;
      }

      setCompetitors(data.data.competitors);
      setCompetitorKeywords(
        data.data.competitorKeywords.map((ck: { domain: string; topKeywords: CompetitorKeyword[] }) => ({
          domain: ck.domain,
          keywords: ck.topKeywords,
        }))
      );

      // Mark competitors as completed
      setCompletedTabs((prev) => [...prev, "competitors"]);

      // Update credits via context
      if (data.creditsRemaining !== undefined) {
        refreshCredits();
      }

      // Show success toast
      toast.success(`Found ${data.data.competitors.length} competitors`);
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoadingTab(null);
    }
  }, [currentSession, refreshCredits]);

  // Handle content planning (Tab 3)
  const handleGenerateContentPlan = useCallback(async () => {
    if (!currentSession) return;

    setError(null);
    setLoadingTab("content");
    setActiveTab("content");

    try {
      const response = await fetch("/api/research/content-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSession.id,
          includeGaps: competitors.length > 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          setError("Insufficient credits. Please purchase more credits to continue.");
        } else {
          setError(data.error || "Failed to generate content plan");
        }
        return;
      }

      setContentClusters(data.data.clusters);
      setContentGaps(data.data.contentGaps);

      // Mark content as completed
      setCompletedTabs((prev) => [...prev, "content"]);

      // Update credits via context
      if (data.creditsRemaining !== undefined) {
        refreshCredits();
      }

      // Show success toast
      toast.success("Content plan generated");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoadingTab(null);
    }
  }, [currentSession, competitors.length, refreshCredits]);

  // Handle selecting a recent session
  const handleSelectSession = useCallback(async (session: ResearchSession) => {
    setCurrentSession(session);
    setError(null);

    // Restore session data
    if (session.keywords) {
      const keywordData: KeywordData[] = session.keywords.map((kw) => ({
        keyword: kw.keyword,
        searchVolume: kw.searchVolume,
        difficulty: kw.difficulty,
        cpc: kw.cpc,
        competition: kw.competition as "low" | "medium" | "high",
        keywordScore: kw.keywordScore,
        trend: kw.trend,
      }));
      setKeywords(keywordData);
    }

    if (session.validationSummary) {
      setValidationSummary(session.validationSummary);
    }

    if (session.competitors) {
      setCompetitors(session.competitors);
    }

    if (session.competitorKeywords) {
      // Group by domain
      const byDomain = new Map<string, CompetitorKeyword[]>();
      session.competitorKeywords.forEach((kw) => {
        const domain = (kw as unknown as { sourceDomain?: string }).sourceDomain || "";
        if (!byDomain.has(domain)) {
          byDomain.set(domain, []);
        }
        byDomain.get(domain)!.push(kw);
      });
      setCompetitorKeywords(
        Array.from(byDomain.entries()).map(([domain, keywords]) => ({
          domain,
          keywords,
        }))
      );
    }

    if (session.contentClusters) {
      setContentClusters(session.contentClusters);
    }

    if (session.contentGaps) {
      setContentGaps(session.contentGaps);
    }

    // Set completed tabs based on data
    const completed: ResearchTab[] = [];
    if (session.keywords && session.keywords.length > 0) {
      completed.push("validation");
    }
    if (session.competitors && session.competitors.length > 0) {
      completed.push("competitors");
    }
    if (session.contentClusters && session.contentClusters.length > 0) {
      completed.push("content");
    }
    setCompletedTabs(completed);

    // Set active tab to last completed or first incomplete
    if (completed.includes("content")) {
      setActiveTab("content");
    } else if (completed.includes("competitors")) {
      setActiveTab("competitors");
    } else {
      setActiveTab("validation");
    }
  }, []);

  // Handle starting new research
  const handleNewResearch = useCallback(() => {
    setCurrentSession(null);
    setKeywords([]);
    setValidationSummary(null);
    setCompetitors([]);
    setCompetitorKeywords([]);
    setContentClusters([]);
    setContentGaps([]);
    setCompletedTabs([]);
    setActiveTab("validation");
    setError(null);
  }, []);

  // Calculate metrics for validation summary
  const totalVolume = keywords.reduce((sum, kw) => sum + kw.searchVolume, 0);
  const avgDifficulty =
    keywords.length > 0
      ? keywords.reduce((sum, kw) => sum + kw.difficulty, 0) / keywords.length
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🔬</span>
          <h1 className="text-3xl font-bold">Research Hub</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Describe your idea and we'll help you validate the market, find competitors, and plan your content.
        </p>
      </div>

      {/* Low credit warning */}
      {credits !== null && <LowCreditWarning credits={credits} />}

      {/* Session header if active */}
      {currentSession && (
        <div className="animate-fade-in-up">
          <SessionHeader session={currentSession} onClose={handleNewResearch} />
        </div>
      )}

      {/* Research input (only show if no active session or no validation done) */}
      {(!currentSession || !completedTabs.includes("validation")) && (
        <div className="animate-fade-in-up stagger-1">
          <ResearchInput
            onSubmit={handleGenerate}
            isLoading={loadingTab === "validation"}
            defaultDescription={currentSession?.description || ""}
          />
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="p-5 rounded-2xl bg-destructive/10 border-2 border-destructive/30 text-destructive flex items-start gap-4 animate-bounce-in">
          <div className="p-2 rounded-xl bg-destructive/20">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-bold">Oops! Something went wrong</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="p-1.5 rounded-lg text-destructive/70 hover:text-destructive hover:bg-destructive/20 transition-colors shrink-0"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tabs and content (show after validation started) */}
      {(completedTabs.length > 0 || loadingTab) && (
        <div className="space-y-6 animate-fade-in-up stagger-2">
          {/* Tabs */}
          <ResearchTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            completedTabs={completedTabs}
            loadingTab={loadingTab}
          />

          {/* Tab 1: Validation */}
          <TabContent isActive={activeTab === "validation"}>
            <div className="space-y-6">
              {validationSummary && (
                <ValidationSummary
                  summary={validationSummary}
                  totalVolume={totalVolume}
                  avgDifficulty={avgDifficulty}
                  keywordCount={keywords.length}
                  onFindCompetitors={
                    completedTabs.includes("validation")
                      ? handleFindCompetitors
                      : undefined
                  }
                />
              )}

              {keywords.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-xl bg-primary/15">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold">
                      {keywords.length} Keywords Generated
                    </h3>
                  </div>
                  <KeywordTable keywords={keywords} isLoading={loadingTab === "validation"} />
                </div>
              )}
            </div>
          </TabContent>

          {/* Tab 2: Competitors */}
          <TabContent isActive={activeTab === "competitors"}>
            <div className="space-y-6">
              {loadingTab === "competitors" ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p>Discovering competitors...</p>
                </div>
              ) : competitors.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">
                      Top {competitors.length} Competitors
                    </h3>
                    {completedTabs.includes("competitors") && (
                      <button
                        onClick={handleGenerateContentPlan}
                        className={cn(
                          "px-4 py-2 rounded-xl font-medium",
                          "bg-primary text-primary-foreground hover:bg-primary/90",
                          "transition-colors"
                        )}
                      >
                        Generate Content Plan →
                      </button>
                    )}
                  </div>
                  <CompetitorList
                    competitors={competitors}
                    competitorKeywords={competitorKeywords}
                  />
                </div>
              ) : completedTabs.includes("validation") ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    Ready to discover your competitors?
                  </p>
                  <button
                    onClick={handleFindCompetitors}
                    className={cn(
                      "px-6 py-3 rounded-xl font-medium",
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                      "transition-colors"
                    )}
                  >
                    Find Competitors
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Complete validation first to discover competitors.
                </div>
              )}
            </div>
          </TabContent>

          {/* Tab 3: Content Plan */}
          <TabContent isActive={activeTab === "content"}>
            <div className="space-y-6">
              {loadingTab === "content" ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p>Creating your content plan...</p>
                </div>
              ) : contentClusters.length > 0 ? (
                <ContentPlan clusters={contentClusters} gaps={contentGaps} />
              ) : completedTabs.includes("competitors") ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    Ready to create your content roadmap?
                  </p>
                  <button
                    onClick={handleGenerateContentPlan}
                    className={cn(
                      "px-6 py-3 rounded-xl font-medium",
                      "bg-primary text-primary-foreground hover:bg-primary/90",
                      "transition-colors"
                    )}
                  >
                    Generate Content Plan
                  </button>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Complete competitor discovery first to generate content plan.
                </div>
              )}
            </div>
          </TabContent>
        </div>
      )}

      {/* Recent sessions (show when no active session and no results) */}
      {!currentSession && keywords.length === 0 && !loadingTab && (
        <div className="animate-fade-in-up stagger-2">
          <RecentSessions
            sessions={recentSessions}
            onSelectSession={handleSelectSession}
            isLoading={isLoadingSessions}
          />
        </div>
      )}

      {/* Empty state (show when no session and no recent sessions) */}
      {!currentSession &&
        keywords.length === 0 &&
        !loadingTab &&
        recentSessions.length === 0 &&
        !isLoadingSessions && (
          <div className="text-center py-20 animate-fade-in-up stagger-2">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-primary mb-8 shadow-playful-lg animate-float">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Start your first research</h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto mb-10">
              Describe your niche idea above and we'll help you validate the market,
              discover competitors, and plan your content strategy.
            </p>
          </div>
        )}
    </div>
  );
}
