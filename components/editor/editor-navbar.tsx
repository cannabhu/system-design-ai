"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import {
  AlertCircle,
  Check,
  LayoutTemplate,
  Loader2,
  Save,
  PanelLeftClose,
  PanelLeftOpen,
  Share2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { SaveStatus } from "@/hooks/use-canvas-autosave";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  projectName?: string;
  isAiSidebarOpen?: boolean;
  onToggleAiSidebar?: () => void;
  onShare?: () => void;
  onOpenTemplates?: () => void;
  saveStatus?: SaveStatus;
  onSave?: () => void;
}

const SAVE_LABELS: Record<SaveStatus, string> = {
  idle: "Save",
  saving: "Saving…",
  saved: "Saved",
  error: "Save failed",
};

function SaveIcon({ status }: { status: SaveStatus }) {
  if (status === "saving") return <Loader2 className="h-4 w-4 animate-spin" />;
  if (status === "saved")
    return <Check className="h-4 w-4 text-state-success" />;
  if (status === "error") {
    return <AlertCircle className="h-4 w-4 text-state-error" />;
  }
  return <Save className="h-4 w-4" />;
}

/**
 * Clerk's UserButton mounts imperatively, so its host <div> exists on the
 * client's first render but not in the server HTML. Render it only after
 * mount, behind a same-size placeholder, to avoid the hydration mismatch.
 */
const subscribeNoop = () => () => {};

function NavbarUserButton() {
  // false during SSR and hydration, true afterwards — no setState in an effect.
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  if (!mounted) {
    return <div aria-hidden className="h-7 w-7 rounded-full bg-subtle" />;
  }
  return <UserButton appearance={{ elements: { avatarBox: "h-7 w-7" } }} />;
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  projectName,
  isAiSidebarOpen = false,
  onToggleAiSidebar,
  onShare,
  onOpenTemplates,
  saveStatus = "idle",
  onSave,
}: EditorNavbarProps) {
  const ToggleIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;

  return (
    <TooltipProvider>
      <header className="relative z-50 flex h-14 shrink-0 items-center gap-2 border-b border-surface-border bg-surface px-3 md:grid md:grid-cols-[1fr_auto_1fr]">
        <div className="flex shrink-0 items-center justify-start gap-1 md:gap-2">
          <Link
            href="/editor"
            aria-label="Grand AI home"
            className="flex items-center gap-2 rounded-xl px-1.5 py-1 text-sm font-semibold tracking-tight text-copy-primary transition-colors outline-none hover:bg-subtle focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-ai text-copy-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline">Grand AI</span>
          </Link>
          <span aria-hidden className="mx-0.5 h-5 w-px bg-surface-border" />
          <Tooltip content={isSidebarOpen ? "Close sidebar" : "Open sidebar"}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
              aria-expanded={isSidebarOpen}
              className="text-copy-muted hover:bg-subtle hover:text-copy-primary"
            >
              <ToggleIcon className="h-5 w-5" />
            </Button>
          </Tooltip>
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-center">
          {projectName && (
            <h1 className="min-w-0 max-w-xs truncate rounded-xl px-3 py-1.5 text-sm font-medium text-copy-primary md:bg-elevated">
              {projectName}
            </h1>
          )}
        </div>
        <div className="flex shrink-0 items-center justify-end gap-1.5 md:gap-2">
          {projectName && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenTemplates}
                aria-label="Templates"
                className="max-md:w-9 max-md:px-0"
              >
                <LayoutTemplate className="h-4 w-4" />
                <span className="hidden md:inline">Templates</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onSave}
                disabled={saveStatus === "saving"}
                aria-live="polite"
                aria-label={SAVE_LABELS[saveStatus]}
                className="max-md:w-9 max-md:px-0"
              >
                <SaveIcon status={saveStatus} />
                <span className="hidden md:inline">
                  {SAVE_LABELS[saveStatus]}
                </span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onShare}
                aria-label="Share"
                className="max-md:w-9 max-md:px-0"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden md:inline">Share</span>
              </Button>
              <span
                aria-hidden
                className="mx-0.5 hidden h-5 w-px bg-surface-border md:block"
              />
              <Tooltip
                content={
                  isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"
                }
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleAiSidebar}
                  aria-label={
                    isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"
                  }
                  aria-expanded={isAiSidebarOpen}
                  className={cn(
                    "text-ai-text hover:bg-ai/15 hover:text-ai-text max-md:w-9 max-md:px-0",
                    isAiSidebarOpen && "bg-ai/15",
                  )}
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden md:inline">AI</span>
                </Button>
              </Tooltip>
            </>
          )}
          <NavbarUserButton />
        </div>
      </header>
    </TooltipProvider>
  );
}
