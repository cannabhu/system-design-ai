"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useRealtimeRun } from "@trigger.dev/react-hooks";
import { Bot, Loader2, SendHorizontal } from "lucide-react";

import type { designAgentTask } from "@/trigger/design-agent";

import { useAiChat } from "@/components/editor/ai-chat-context";
import { useAiStatus } from "@/components/editor/ai-status-context";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const STARTER_PROMPTS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
];

const MAX_TEXTAREA_HEIGHT = 160;

interface ActiveRun {
  runId: string;
  publicToken: string;
}

const RUN_STATUS_TEXT: Record<string, string> = {
  PENDING_VERSION: "Getting Grand AI ready…",
  QUEUED: "Waiting for Grand AI to start…",
  DEQUEUED: "Starting Grand AI…",
  EXECUTING: "Grand AI is thinking about your request…",
};

/** Subscribes to a run and reports its progress. Renders nothing. */
function RunWatcher({
  runId,
  publicToken,
  onStatus,
  onEnd,
}: ActiveRun & {
  onStatus: (text: string) => void;
  onEnd: (result: { summary?: string; error?: string }) => void;
}) {
  const { run, error } = useRealtimeRun<typeof designAgentTask>(runId, {
    accessToken: publicToken,
    skipColumns: ["payload"],
    onComplete: (finished, runError) => {
      if (runError) return onEnd({ error: runError.message });
      if (finished.status === "COMPLETED") {
        return onEnd({ summary: finished.output?.summary });
      }
      onEnd({ error: `Run ${finished.status.toLowerCase()}.` });
    },
  });

  const status = run?.status;
  useEffect(() => {
    const text = status ? RUN_STATUS_TEXT[status] : undefined;
    if (text) onStatus(text);
  }, [status, onStatus]);

  useEffect(() => {
    if (error) onEnd({ error: error.message });
  }, [error, onEnd]);

  return null;
}

export function AiArchitectTab({
  roomId,
  onBusyChange,
}: {
  roomId: string;
  onBusyChange?: (busy: boolean) => void;
}) {
  const { messages, currentUserId, send } = useAiChat();
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [run, setRun] = useState<ActiveRun | null>(null);
  const runRef = useRef<ActiveRun | null>(null);
  const [localStatus, setLocalStatus] = useState<string | null>(null);
  const {
    isGenerating: isRoomGenerating,
    statusText,
    statusRunId,
  } = useAiStatus();
  // Active for the submitter (sending/run) and for collaborators (presence).
  const isGenerating = isRoomGenerating || run !== null || isSending;
  // Feed text is shown only once it belongs to this run, so a previous run's
  // final message never flashes up; until then the local step text fills in.
  const feedIsCurrent = run ? statusRunId === run.runId : isRoomGenerating;
  const displayStatus =
    (feedIsCurrent ? statusText : null) ??
    localStatus ??
    "Grand AI is working…";
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [input]);

  useEffect(() => {
    onBusyChange?.(isSending || run !== null);
  }, [isSending, run, onBusyChange]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  async function submit() {
    const content = input.trim();
    if (!content || isGenerating || isSending) return;
    setIsSending(true);
    setSendError(null);
    setLocalStatus("Sending your request…");
    try {
      await send(content);
      setInput("");
    } catch {
      setSendError("Message failed to send. Try again.");
      setIsSending(false);
      return;
    }

    setLocalStatus("Starting Grand AI…");
    try {
      const designResponse = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: content, roomId, projectId: roomId }),
      });
      if (!designResponse.ok) throw new Error("Could not start the design run.");
      const { runId } = (await designResponse.json()) as { runId: string };

      const tokenResponse = await fetch("/api/ai/design/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId }),
      });
      if (!tokenResponse.ok) throw new Error("Could not track the design run.");
      const { token } = (await tokenResponse.json()) as { token: string };

      runRef.current = { runId, publicToken: token };
      setRun(runRef.current);
    } catch (error) {
      await postAiMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setIsSending(false);
    }
  }

  async function postAiMessage(content: string) {
    try {
      await send(content, "assistant");
    } catch {
      setSendError("Could not post the AI response.");
    }
  }

  const handleRunEnd = useCallback(
    ({ summary, error }: { summary?: string; error?: string }) => {
      // The hook can report both an error and completion; handle one.
      if (!runRef.current) return;
      runRef.current = null;
      setRun(null);
      void postAiMessage(
        error
          ? `Something went wrong: ${error}`
          : (summary ?? "Done. Your design is on the canvas."),
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [send],
  );

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  }

  function pickStarter(prompt: string) {
    setInput(prompt);
    textareaRef.current?.focus();
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {run && (
        <RunWatcher
          runId={run.runId}
          publicToken={run.publicToken}
          onStatus={setLocalStatus}
          onEnd={handleRunEnd}
        />
      )}
      <ScrollArea className="min-h-0 flex-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <Bot className="h-8 w-8 text-ai-text" />
            <p className="text-sm font-medium text-copy-secondary">
              Describe a system to design
            </p>
            <p className="text-xs text-copy-muted">
              Ask Grand AI to sketch an architecture, then refine it together on
              the canvas.
            </p>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => pickStarter(prompt)}
                  className="rounded-full bg-subtle px-3 py-1.5 text-xs text-ai-text transition-colors hover:bg-elevated"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 px-4 py-4">
            {messages.map((message) => {
              const isOwn = message.sender.id === currentUserId;
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex flex-col gap-1",
                    message.role === "assistant"
                      ? "max-w-[92%] self-start items-start"
                      : isOwn
                        ? "max-w-[85%] self-end items-end"
                        : "max-w-[85%] self-start items-start",
                  )}
                >
                  <div className="flex items-baseline gap-2 text-[11px] text-copy-muted">
                    <span className="font-medium text-copy-secondary">
                      {isOwn ? "You" : message.sender.name}
                    </span>
                    <time dateTime={new Date(message.timestamp).toISOString()}>
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                  {message.role === "assistant" ? (
                    <div className="flex items-start gap-2">
                      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-subtle">
                        <Bot className="h-3.5 w-3.5 text-ai-text" />
                      </div>
                      <div className="rounded-2xl border border-surface-border bg-base px-3 py-2 text-sm leading-relaxed break-words whitespace-pre-wrap text-ai-text">
                        {message.content}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-[#62C073] px-3 py-2 text-sm break-words whitespace-pre-wrap text-[#08140b]">
                      {message.content}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      <div className="shrink-0 border-t border-surface-border p-3">
        {isGenerating && (
          <div
            role="status"
            aria-live="polite"
            className="mb-2 flex items-center gap-2 overflow-hidden rounded-md border border-[#62C073]/30 bg-base px-2.5 py-1.5 text-xs text-copy-secondary"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#62C073] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#62C073]" />
            </span>
            <span className="truncate">{displayStatus}</span>
          </div>
        )}
        {sendError && (
          <p role="alert" className="mb-2 text-xs text-red-400">
            {sendError}
          </p>
        )}
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your system…"
            aria-label="Message Grand AI"
            rows={1}
            disabled={isGenerating}
            className="field-sizing-fixed min-h-[72px] max-h-40 resize-none overflow-y-auto border-surface-border bg-surface py-2 pr-24 text-sm text-copy-primary"
          />
          <Button
            size="sm"
            onClick={() => void submit()}
            disabled={!input.trim() || isGenerating || isSending}
            aria-label="Send message"
            className="absolute right-2 bottom-2 bg-[#62C073] text-[#08140b] hover:bg-[#62C073]/90 disabled:opacity-40"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking
              </>
            ) : (
              <>
                <SendHorizontal className="h-4 w-4" />
                Send
              </>
            )}
          </Button>
        </div>
        <p className="mt-1.5 text-[11px] text-copy-faint">
          Enter to send · Shift+Enter for a new line
        </p>
      </div>
    </div>
  );
}
