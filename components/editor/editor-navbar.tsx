"use client";

import { useSyncExternalStore } from "react";
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
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-surface-border bg-surface px-3 md:grid md:grid-cols-3">
      <div className="flex shrink-0 items-center justify-start">
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
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-center">
        {projectName && (
          <h1 className="min-w-0 truncate text-sm font-medium text-copy-primary">
            {projectName}
          </h1>
        )}
      </div>
      <div className="flex shrink-0 items-center justify-end gap-1 md:gap-2">
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
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleAiSidebar}
              aria-label={
                isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"
              }
              aria-expanded={isAiSidebarOpen}
              className="text-copy-muted hover:bg-subtle hover:text-ai-text"
            >
              <Sparkles className="h-5 w-5" />
            </Button>
          </>
        )}
        <NavbarUserButton />
      </div>
    </header>
  );
}
