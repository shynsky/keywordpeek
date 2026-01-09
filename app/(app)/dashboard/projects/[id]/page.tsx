"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  Search,
  FolderOpen,
  Sparkles,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { KeywordTable, type KeywordData } from "@/components/keyword-table";
import { CsvExportButton } from "@/components/csv-export-button";
import { createClient } from "@/lib/supabase/client";
import type { Json } from "@/lib/supabase/types";

interface Project {
  id: string;
  name: string;
  domain: string | null;
}

interface SavedKeyword {
  id: string;
  keyword: string;
  search_volume: number | null;
  difficulty: number | null;
  cpc: number | null;
  keyword_score: number | null;
  status: string;
  data: Json;
  created_at: string;
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [keywords, setKeywords] = useState<SavedKeyword[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDomain, setEditDomain] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingKeywordId, setDeletingKeywordId] = useState<string | null>(null);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    setIsLoading(true);
    const supabase = createClient();

    // Fetch project
    const { data: projectData } = await supabase
      .from("projects")
      .select("id, name, domain")
      .eq("id", id)
      .single();

    if (!projectData) {
      router.push("/dashboard/projects");
      return;
    }

    setProject(projectData);
    setEditName(projectData.name);
    setEditDomain(projectData.domain || "");

    // Fetch keywords
    const { data: keywordsData } = await supabase
      .from("keywords")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: false });

    if (keywordsData) {
      setKeywords(keywordsData);
    }

    setIsLoading(false);
  };

  const handleUpdateProject = async () => {
    if (!editName.trim()) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("projects")
      .update({
        name: editName.trim(),
        domain: editDomain.trim() || null,
      })
      .eq("id", id);

    if (!error) {
      setProject((prev) =>
        prev
          ? { ...prev, name: editName.trim(), domain: editDomain.trim() || null }
          : null
      );
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (!error) {
      router.push("/dashboard/projects");
    }
    setIsDeleting(false);
  };

  const handleDeleteKeyword = async (keywordId: string) => {
    setDeletingKeywordId(keywordId);
    const supabase = createClient();
    const { error } = await supabase.from("keywords").delete().eq("id", keywordId);

    if (!error) {
      setKeywords((prev) => prev.filter((k) => k.id !== keywordId));
    }
    setDeletingKeywordId(null);
  };

  const handleUpdateKeywordStatus = async (keywordId: string, newStatus: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("keywords")
      .update({ status: newStatus })
      .eq("id", keywordId);

    if (!error) {
      setKeywords((prev) =>
        prev.map((k) => (k.id === keywordId ? { ...k, status: newStatus } : k))
      );
    }
  };

  // Transform saved keywords to KeywordData format
  const keywordData: KeywordData[] = keywords
    .filter((k) => {
      const matchesSearch = k.keyword
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || k.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .map((k) => {
      const data = k.data as { competition?: string; trend?: { year: number; month: number; volume: number }[] } | null | undefined;
      return {
        keyword: k.keyword,
        searchVolume: k.search_volume || 0,
        difficulty: k.difficulty || 0,
        cpc: k.cpc || 0,
        competition: (data?.competition as "low" | "medium" | "high") || "medium",
        keywordScore: k.keyword_score || 0,
        trend: data?.trend,
      };
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-playful animate-pulse-glow">
            <FolderOpen className="h-8 w-8 text-white" />
          </div>
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between animate-fade-in-up">
        <div>
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to projects
          </Link>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center shadow-playful">
              <FolderOpen className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              {project.domain && (
                <a
                  href={`https://${project.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mt-1"
                >
                  {project.domain}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
          <p className="text-muted-foreground text-lg mt-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
              <span>🔑</span>
              {keywords.length} saved keyword{keywords.length !== 1 ? "s" : ""}
            </span>
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-xl h-11 w-11">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit project
            </DropdownMenuItem>
            {project.domain && (
              <DropdownMenuItem
                onClick={() =>
                  window.open(`https://${project.domain}`, "_blank")
                }
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit site
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDeleteProject}
              className="text-destructive focus:text-destructive"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filters */}
      {keywords.length > 0 && (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border-2 border-border animate-fade-in-up stagger-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="saved">Saved</SelectItem>
              <SelectItem value="targeting">Targeting</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
          <CsvExportButton
            keywords={keywordData}
            filename={`${project.name.toLowerCase().replace(/\s+/g, "-")}-keywords`}
          />
        </div>
      )}

      {/* Keywords table */}
      {keywords.length > 0 ? (
        <div className="animate-fade-in-up stagger-2">
          <KeywordTable keywords={keywordData} />
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-border rounded-2xl bg-card animate-fade-in-up stagger-2">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-primary mb-8 shadow-playful-lg animate-float">
            <Search className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3">
            No keywords saved yet
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8">
            Search for keywords and save them to this project to track your
            research.
          </p>
          <Button variant="primary" size="lg" asChild className="gap-2">
            <Link href="/dashboard">
              <Sparkles className="h-5 w-5" />
              Start researching
            </Link>
          </Button>
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update your project details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Project Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-domain">Domain</Label>
              <Input
                id="edit-domain"
                placeholder="example.com"
                value={editDomain}
                onChange={(e) => setEditDomain(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProject}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
