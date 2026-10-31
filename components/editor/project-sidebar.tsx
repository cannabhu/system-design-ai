"use client";

import { FolderOpen, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useProjectDialogsContext } from "@/components/editor/project-dialogs-context";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/projects";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <Icon className="h-8 w-8 text-copy-faint" />
      <p className="text-sm font-medium text-copy-secondary">{title}</p>
      <p className="text-xs text-copy-muted">{description}</p>
    </div>
  );
}

interface ProjectItemProps {
  project: Project;
  onRename: (project: Project) => void;
  onDelete: (project: Project) => void;
}

function ProjectItem({ project, onRename, onDelete }: ProjectItemProps) {
  const isOwner = project.role === "owner";

  return (
    <li className="flex items-center gap-1 rounded-xl px-3 py-2 hover:bg-subtle">
      <span className="min-w-0 flex-1 truncate text-sm text-copy-secondary">
        {project.name}
      </span>
      {isOwner && (
        <>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onRename(project)}
            aria-label={`Rename ${project.name}`}
            className="text-copy-muted hover:text-copy-primary"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onDelete(project)}
            aria-label={`Delete ${project.name}`}
            className="text-copy-muted hover:text-state-error"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </>
      )}
    </li>
  );
}

export function ProjectSidebar({ isOpen, onClose }: ProjectSidebarProps) {
  const { projects, openCreate, openRename, openDelete } =
    useProjectDialogsContext();
  const owned = projects.filter((p) => p.role === "owner");
  const shared = projects.filter((p) => p.role === "collaborator");

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "absolute inset-0 z-30 bg-base/70 transition-opacity duration-200 md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        aria-label="Projects"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={cn(
          "absolute top-0 bottom-0 left-0 z-40 flex w-80 flex-col border-r border-surface-border bg-surface/95 backdrop-blur-md transition-transform duration-200 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-surface-border px-4">
          <h2 className="text-sm font-semibold text-copy-primary">Projects</h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close sidebar"
            className="text-copy-muted hover:bg-subtle hover:text-copy-primary"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="my-projects" className="min-h-0 flex-1 gap-0">
          <TabsList className="mx-4 mt-3 w-auto self-stretch bg-elevated">
            <TabsTrigger value="my-projects">My Projects</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
          </TabsList>
          <TabsContent value="my-projects" className="flex min-h-0 flex-col">
            {owned.length === 0 ? (
              <EmptyState
                icon={FolderOpen}
                title="No projects yet"
                description="Create your first project to get started."
              />
            ) : (
              <ul className="space-y-1 overflow-y-auto p-3">
                {owned.map((project) => (
                  <ProjectItem
                    key={project.id}
                    project={project}
                    onRename={openRename}
                    onDelete={openDelete}
                  />
                ))}
              </ul>
            )}
          </TabsContent>
          <TabsContent value="shared" className="flex min-h-0 flex-col">
            {shared.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Nothing shared with you"
                description="Projects others share with you will appear here."
              />
            ) : (
              <ul className="space-y-1 overflow-y-auto p-3">
                {shared.map((project) => (
                  <ProjectItem
                    key={project.id}
                    project={project}
                    onRename={openRename}
                    onDelete={openDelete}
                  />
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>

        <div className="shrink-0 border-t border-surface-border p-4">
          <Button className="w-full" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  );
}
