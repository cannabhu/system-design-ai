"use client";

import { useState } from "react";
import { Bot, Loader2, X } from "lucide-react";

import { AiArchitectTab } from "@/components/editor/ai-architect-tab";
import { useAiStatus } from "@/components/editor/ai-status-context";
import { ChatTab } from "@/components/editor/chat-tab";
import { SpecsTab } from "@/components/editor/specs-tab";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface AiSidebarProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
}

const tabTriggerClass =
  "text-copy-muted hover:text-copy-primary data-active:bg-accent-dim data-active:text-brand dark:data-active:border-transparent dark:data-active:bg-accent-dim dark:data-active:text-brand";

export function AiSidebar({ roomId, isOpen, onClose }: AiSidebarProps) {
  const { isGenerating } = useAiStatus();
  // Covers the gap between submitting and the agent's presence appearing.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isWorking = isGenerating || isSubmitting;

  return (
    <aside
      aria-label="AI assistant"
      aria-hidden={!isOpen}
      inert={!isOpen}
      className={cn(
        "absolute top-0 right-0 bottom-0 z-40 flex w-96 max-w-full flex-col border-l border-surface-border bg-base/95 shadow-2xl backdrop-blur-md transition-transform duration-200 ease-out",
        isOpen ? "translate-x-0" : "translate-x-full",
      )}
    >
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-surface-border px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-subtle">
          <Bot className="h-4 w-4 text-ai-text" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-copy-primary">
            AI Workspace
          </h2>
          <p className="truncate text-xs text-copy-muted">
            Collaborate with Grand AI
          </p>
        </div>
        {isWorking && (
          <span
            role="status"
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-accent-dim px-2 py-0.5 text-[11px] font-medium text-ai-text"
          >
            <Loader2 className="h-3 w-3 animate-spin" />
            Working
          </span>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onClose}
          aria-label="Close AI sidebar"
          className="text-copy-muted hover:text-copy-primary"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="architect" className="min-h-0 flex-1 gap-0">
        <TabsList className="mx-4 mt-3 mb-3 w-auto self-stretch bg-surface">
          <TabsTrigger value="architect" className={tabTriggerClass}>
            AI Architect
          </TabsTrigger>
          <TabsTrigger value="chat" className={tabTriggerClass}>
            Chat
          </TabsTrigger>
          <TabsTrigger value="specs" className={tabTriggerClass}>
            Specs
          </TabsTrigger>
        </TabsList>
        <TabsContent value="architect" className="flex min-h-0 flex-col">
          <AiArchitectTab roomId={roomId} onBusyChange={setIsSubmitting} />
        </TabsContent>
        <TabsContent value="chat" className="flex min-h-0 flex-col">
          <ChatTab />
        </TabsContent>
        <TabsContent value="specs" className="flex min-h-0 flex-col">
          <SpecsTab />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
