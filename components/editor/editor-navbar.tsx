import { UserButton } from "@clerk/nextjs";
import {
  LayoutTemplate,
  PanelLeftClose,
  PanelLeftOpen,
  Share2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  projectName?: string;
  isAiSidebarOpen?: boolean;
  onToggleAiSidebar?: () => void;
  onShare?: () => void;
  onOpenTemplates?: () => void;
}

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  projectName,
  isAiSidebarOpen = false,
  onToggleAiSidebar,
  onShare,
  onOpenTemplates,
}: EditorNavbarProps) {
  const ToggleIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;

  return (
    <header className="grid h-14 shrink-0 grid-cols-3 items-center border-b border-surface-border bg-surface px-3">
      <div className="flex items-center justify-start">
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
      <div className="flex items-center justify-center">
        {projectName && (
          <h1 className="truncate text-sm font-medium text-copy-primary">
            {projectName}
          </h1>
        )}
      </div>
      <div className="flex items-center justify-end gap-2">
        {projectName && (
          <>
            <Button variant="outline" size="sm" onClick={onOpenTemplates}>
              <LayoutTemplate className="h-4 w-4" />
              Templates
            </Button>
            <Button variant="outline" size="sm" onClick={onShare}>
              <Share2 className="h-4 w-4" />
              Share
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
        <UserButton />
      </div>
    </header>
  );
}
