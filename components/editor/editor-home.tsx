"use client";

import { Plus, Share2, Sparkles, Workflow } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useProjectDialogsContext } from "@/components/editor/project-dialogs-context";
import { Button } from "@/components/ui/button";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  iconClass: string;
}

const FEATURES: Feature[] = [
  {
    icon: Workflow,
    title: "Diagram freely",
    description: "Drag shapes onto an infinite canvas and wire them together.",
    iconClass: "bg-accent-dim text-brand",
  },
  {
    icon: Sparkles,
    title: "Generate with AI",
    description: "Describe a system and let the AI architect draft it.",
    iconClass: "bg-ai/15 text-ai-text",
  },
  {
    icon: Share2,
    title: "Collaborate live",
    description: "Invite teammates and edit together in real time.",
    iconClass: "bg-state-success/15 text-state-success",
  },
];

export function EditorHome() {
  const { openCreate } = useProjectDialogsContext();

  return (
    <main className="flex h-full flex-col items-center justify-center gap-8 overflow-y-auto px-6 py-10 text-center">
      <div className="flex max-w-md flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-surface-border bg-surface text-brand shadow-lg">
          <Workflow className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-copy-primary">
          Create a project or open an existing one
        </h1>
        <p className="text-sm text-copy-muted">
          Start a new architecture workspace, or choose a project from the
          sidebar.
        </p>
        <Button size="lg" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <ul className="grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, description, iconClass }) => (
          <li
            key={title}
            className="flex flex-col items-center gap-2 rounded-2xl border border-surface-border bg-surface p-4 text-center transition-colors hover:border-surface-border-subtle hover:bg-elevated"
          >
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <p className="text-sm font-medium text-copy-primary">{title}</p>
            <p className="text-xs text-copy-muted">{description}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
