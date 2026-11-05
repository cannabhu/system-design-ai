"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { Check, Download, FileText, Loader2, Sparkles } from "lucide-react";

import { useAiChat } from "@/components/editor/ai-chat-context";
import { useCanvasSnapshot } from "@/components/editor/canvas-snapshot-context";
import { SpecPreviewDialog } from "@/components/editor/spec-preview-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { generateSpecTask } from "@/trigger/generate-spec";

export interface SpecItem {
  id: string;
  createdAt: string;
  filename: string;
}

interface SpecsTabProps {
  projectId: string;
}

type ListState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; specs: SpecItem[] };

// ProjectSpec stores no filename; this matches the download route's header.
function toSpecItem(spec: { id: string; createdAt: string }): SpecItem {
  return {
    ...spec,
    filename: `spec-${spec.createdAt.slice(0, 10)}.md`,
  };
}

interface ActiveRun {
  runId: string;
  publicToken: string;
}

/** Subscribes to a spec run and reports its progress. Renders nothing. */
function SpecRunWatcher({
  runId,
  publicToken,
  onMessage,
  onEnd,
}: ActiveRun & {
  onMessage: (text: string) => void;
  onEnd: (error?: string) => void;
}) {
  const { run, error } = useRealtimeRun<typeof generateSpecTask>(runId, {
    accessToken: publicToken,
    skipColumns: ["payload"],
    onComplete: (finished, runError) => {
      if (runError) return onEnd(runError.message);
      if (finished.status === "COMPLETED") return onEnd();
      onEnd(`Spec generation ${finished.status.toLowerCase()}.`);
    },
  });

  const message = run?.metadata?.message;
  useEffect(() => {
    if (typeof message === "string") onMessage(message);
  }, [message, onMessage]);

  useEffect(() => {
    if (error) onEnd(error.message);
  }, [error, onEnd]);

  return null;
}

const STEPS = ["Reading canvas", "Writing spec", "Saving"] as const;

/** Maps the task's progress message to a step index. */
function stepFor(message: string | null): number {
  if (!message) return 0;
  if (/sav/i.test(message)) return 2;
  if (/writ/i.test(message)) return 1;
  return 0;
}

function GeneratingCard({ message }: { message: string | null }) {
  const active = stepFor(message);
  return (
    <div
      role="status"
      aria-live="polite"
      className="relative overflow-hidden rounded-2xl border border-ai/40 bg-elevated p-3"
    >
      <div className="pointer-events-none absolute inset-0 animate-pulse bg-gradient-to-br from-ai/10 via-transparent to-transparent" />
      <div className="relative flex items-center gap-3">
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-subtle">
          <span className="absolute inset-0 animate-ping rounded-xl bg-ai/20" />
          <Sparkles className="relative h-4 w-4 animate-pulse text-ai-text" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-copy-primary">
            Grand AI is writing your spec
          </p>
          <p className="truncate text-xs text-copy-muted">
            {message ?? "Starting…"}
          </p>
        </div>
      </div>

      <ol className="relative mt-3 flex items-center gap-1.5">
        {STEPS.map((label, index) => {
          const done = index < active;
          const current = index === active;
          return (
            <li key={label} className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span
                className={cn(
                  "h-1 rounded-full bg-subtle transition-colors duration-500",
                  done && "bg-ai",
                  current && "animate-pulse bg-ai-text",
                )}
              />
              <span
                className={cn(
                  "flex items-center gap-1 truncate text-[11px] text-copy-faint transition-colors",
                  (done || current) && "text-copy-secondary",
                  current && "text-ai-text",
                )}
              >
                {done && <Check className="h-3 w-3 shrink-0" />}
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function SpecsTab({ projectId }: SpecsTabProps) {
  const [list, setList] = useState<ListState>({ status: "loading" });
  const [selected, setSelected] = useState<SpecItem | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [run, setRun] = useState<ActiveRun | null>(null);
  const runRef = useRef<ActiveRun | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const { messages } = useAiChat();
  const canvas = useCanvasSnapshot();
  const isGenerating = isStarting || run !== null;

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/projects/${projectId}/specs`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error("Request failed");
        const data: { specs: { id: string; createdAt: string }[] } =
          await res.json();
        setList({ status: "ready", specs: data.specs.map(toSpecItem) });
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setList({ status: "error" });
      });

    return () => controller.abort();
  }, [projectId, reloadKey]);

  async function generate() {
    if (isGenerating) return;
    const snapshot = canvas.get();
    if (!snapshot) {
      setGenerateError("The canvas is not connected yet. Try again shortly.");
      return;
    }
    setGenerateError(null);
    setIsStarting(true);
    setProgress("Starting…");
    try {
      const response = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: projectId,
          chatHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
            sender: m.sender.name,
          })),
          nodes: snapshot.nodes,
          edges: snapshot.edges,
        }),
      });
      if (!response.ok) throw new Error("Could not start spec generation.");
      const { runId } = (await response.json()) as { runId: string };

      const tokenResponse = await fetch("/api/ai/spec/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId }),
      });
      if (!tokenResponse.ok) throw new Error("Could not track spec generation.");
      const { token } = (await tokenResponse.json()) as { token: string };

      runRef.current = { runId, publicToken: token };
      setRun(runRef.current);
    } catch (error) {
      setGenerateError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
      setProgress(null);
    } finally {
      setIsStarting(false);
    }
  }

  const handleRunEnd = useCallback((error?: string) => {
    // The hook can report both an error and completion; handle one.
    if (!runRef.current) return;
    runRef.current = null;
    setRun(null);
    setProgress(null);
    if (error) setGenerateError(error);
    else setReloadKey((key) => key + 1);
  }, []);

  return (
    <>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-4 px-4 pb-4">
          <Button
            onClick={() => void generate()}
            disabled={isGenerating}
            className="w-full bg-ai text-white hover:bg-ai/90"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {isGenerating ? "Generating…" : "Generate Spec"}
          </Button>
          {isGenerating && <GeneratingCard message={progress} />}
          {generateError && (
            <p role="alert" className="text-xs text-state-error">
              {generateError}
            </p>
          )}
          {run && (
            <SpecRunWatcher
              {...run}
              onMessage={setProgress}
              onEnd={handleRunEnd}
            />
          )}

          {list.status === "loading" && (
            <ul aria-label="Loading specs" className="flex flex-col gap-2">
              {[0, 1, 2].map((i) => (
                <li
                  key={i}
                  className="flex animate-pulse items-center gap-3 rounded-xl border border-surface-border bg-elevated p-2.5"
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  <div className="h-4 w-4 shrink-0 rounded bg-subtle" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-2/3 rounded bg-subtle" />
                    <div className="h-2.5 w-1/2 rounded bg-subtle" />
                  </div>
                </li>
              ))}
            </ul>
          )}
          {list.status === "error" && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-surface-border px-4 py-8 text-center">
              <p className="text-xs text-state-error">Could not load specs.</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setList({ status: "loading" });
                  setReloadKey((key) => key + 1);
                }}
                className="border border-surface-border text-copy-muted hover:text-copy-primary"
              >
                Try again
              </Button>
            </div>
          )}
          {list.status === "ready" &&
            list.specs.length === 0 &&
            !isGenerating && (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-surface-border px-4 py-8 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-subtle">
                  <FileText className="h-5 w-5 text-ai-text" />
                </div>
                <p className="text-sm font-medium text-copy-primary">
                  No specs yet
                </p>
                <p className="max-w-[220px] text-xs text-copy-muted">
                  Generate a technical spec from your canvas and AI chat. It
                  will show up here to preview and download.
                </p>
              </div>
            )}
          {list.status === "ready" && list.specs.length > 0 && (
            <ul className="flex flex-col gap-2">
              {list.specs.map((spec) => (
                <li
                  key={spec.id}
                  className="flex items-center gap-1 rounded-xl border border-surface-border bg-elevated pr-1 transition-colors hover:bg-subtle"
                >
                  <button
                    type="button"
                    onClick={() => setSelected(spec)}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-xl p-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-ai-text" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-copy-primary">
                        {spec.filename}
                      </span>
                      <span className="block text-xs text-copy-muted">
                        {new Date(spec.createdAt).toLocaleString()}
                      </span>
                    </span>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Download ${spec.filename}`}
                    className="text-copy-muted hover:text-copy-primary"
                    nativeButton={false}
                    render={
                      <a
                        href={`/api/projects/${projectId}/specs/${spec.id}/download`}
                        download
                      />
                    }
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </ScrollArea>

      <SpecPreviewDialog
        projectId={projectId}
        spec={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
