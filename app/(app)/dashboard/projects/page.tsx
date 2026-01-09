"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderOpen,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
  Loader2,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  domain: string | null;
  keywordCount: number;
  created_at: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDomain, setNewProjectDomain] = useState("");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsLoading(false);
      return;
    }

    // Fetch projects with keyword count
    const { data: projectsData } = await supabase
      .from("projects")
      .select(`
        id,
        name,
        domain,
        created_at,
        keywords(count)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (projectsData) {
      setProjects(
        projectsData.map((p) => ({
          id: p.id,
          name: p.name,
          domain: p.domain,
          created_at: p.created_at,
          keywordCount: (p.keywords as { count: number }[])[0]?.count || 0,
        }))
      );
    }
    setIsLoading(false);
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    setIsCreating(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsCreating(false);
      return;
    }

    const { error } = await supabase.from("projects").insert({
      user_id: user.id,
      name: newProjectName.trim(),
      domain: newProjectDomain.trim() || null,
    });

    if (!error) {
      setNewProjectName("");
      setNewProjectDomain("");
      setIsCreateDialogOpen(false);
      fetchProjects();
    }
    setIsCreating(false);
  };

  const handleUpdateProject = async () => {
    if (!editingProject || !editingProject.name.trim()) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("projects")
      .update({
        name: editingProject.name.trim(),
        domain: editingProject.domain?.trim() || null,
      })
      .eq("id", editingProject.id);

    if (!error) {
      setEditingProject(null);
      fetchProjects();
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    setDeletingProjectId(projectId);
    const supabase = createClient();
    const { error } = await supabase.from("projects").delete().eq("id", projectId);

    if (!error) {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    }
    setDeletingProjectId(null);
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.domain?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">📁</span>
            <h1 className="text-3xl font-bold">Projects</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Organize your keyword research by project.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="primary" size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Projects help you organize keywords for different websites or campaigns.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="create-name">Project Name</Label>
                <Input
                  id="create-name"
                  placeholder="My Awesome Blog"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-domain">
                  Domain <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="create-domain"
                  placeholder="example.com"
                  value={newProjectDomain}
                  onChange={(e) => setNewProjectDomain(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateProject} disabled={isCreating}>
                {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      {projects.length > 0 && (
        <div className="relative max-w-md animate-fade-in-up stagger-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12"
          />
        </div>
      )}

      {/* Projects grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-2xl border-2 border-border bg-card animate-shimmer"
            />
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, i) => (
            <div
              key={project.id}
              className="group relative rounded-2xl border-2 border-border bg-card p-6 hover:border-primary/50 hover:shadow-playful-lg hover:-translate-y-1 transition-all duration-300 animate-bounce-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="absolute inset-0 rounded-2xl"
              />

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-playful group-hover:scale-110 transition-transform duration-300">
                    <FolderOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{project.name}</h3>
                    {project.domain && (
                      <p className="text-sm text-muted-foreground">
                        {project.domain}
                      </p>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative z-10 h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setEditingProject(project)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
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
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      {deletingProjectId === project.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-5 flex items-center gap-4 text-sm">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  <span className="text-base">🔑</span>
                  {project.keywordCount} keywords
                </span>
                <span className="text-muted-foreground">
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 animate-fade-in-up stagger-2">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-primary mb-8 shadow-playful-lg animate-float">
            <FolderOpen className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3">
            {searchQuery ? "No projects found" : "Create your first project"}
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8">
            {searchQuery
              ? `No projects match "${searchQuery}". Try a different search.`
              : "Projects help you organize keywords for different websites or campaigns."}
          </p>
          {!searchQuery && (
            <Button variant="primary" size="lg" onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Sparkles className="h-5 w-5" />
              Create your first project
            </Button>
          )}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog
        open={editingProject !== null}
        onOpenChange={(open) => !open && setEditingProject(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          {editingProject && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Project Name</Label>
                <Input
                  id="edit-name"
                  value={editingProject.name}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-domain">Domain</Label>
                <Input
                  id="edit-domain"
                  placeholder="example.com"
                  value={editingProject.domain || ""}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      domain: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProject(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProject}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
