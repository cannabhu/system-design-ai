import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export function AiSidebar({ isOpen }: { isOpen: boolean }) {
  return (
    <aside
      aria-label="AI assistant"
      aria-hidden={!isOpen}
      inert={!isOpen}
      className={cn(
        "flex shrink-0 flex-col overflow-hidden border-l border-surface-border bg-surface transition-[width] duration-200 ease-out",
        isOpen ? "w-80" : "w-0 border-l-0",
      )}
    >
      <div className="flex h-full w-80 flex-col items-center justify-center gap-2 px-6 text-center">
        <Sparkles className="h-8 w-8 text-ai-text" />
        <p className="text-sm font-medium text-copy-secondary">AI assistant</p>
        <p className="text-xs text-copy-muted">AI chat coming soon</p>
      </div>
    </aside>
  );
}
