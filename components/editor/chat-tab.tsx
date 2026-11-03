"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Loader2, MessageSquare, SendHorizontal } from "lucide-react";

import { useTeamChat } from "@/components/editor/team-chat-context";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function ChatTab() {
  const { messages, currentUserId, send } = useTeamChat();
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  async function submit() {
    const content = input.trim();
    if (!content || isSending) return;
    setIsSending(true);
    setSendError(null);
    try {
      await send(content);
      setInput("");
    } catch {
      setSendError("Message failed to send. Try again.");
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScrollArea className="min-h-0 flex-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <MessageSquare className="h-8 w-8 text-ai-text" />
            <p className="text-sm font-medium text-copy-secondary">
              Chat with your team
            </p>
            <p className="text-xs text-copy-muted">
              Messages here are shared with everyone in this project.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 px-4 py-4">
            {messages.map((message) => {
              const isOwn = message.sender.id === currentUserId;
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex max-w-[85%] flex-col gap-1",
                    isOwn ? "items-end self-end" : "items-start self-start",
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
                  <div
                    className={cn(
                      "rounded-2xl px-3 py-2 text-sm break-words whitespace-pre-wrap",
                      isOwn
                        ? "bg-[#62C073] text-[#08140b]"
                        : "border border-surface-border bg-base text-copy-primary",
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      <div className="shrink-0 border-t border-surface-border p-3">
        {sendError && (
          <p role="alert" className="mb-2 text-xs text-red-400">
            {sendError}
          </p>
        )}
        <div className="relative">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message your team…"
            aria-label="Message your team"
            rows={1}
            className="field-sizing-fixed max-h-40 min-h-[72px] resize-none overflow-y-auto border-surface-border bg-surface py-2 pr-24 text-sm text-copy-primary"
          />
          <Button
            size="sm"
            onClick={() => void submit()}
            disabled={!input.trim() || isSending}
            aria-label="Send message"
            className="absolute right-2 bottom-2 bg-[#62C073] text-[#08140b] hover:bg-[#62C073]/90 disabled:opacity-40"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizontal className="h-4 w-4" />
            )}
            Send
          </Button>
        </div>
        <p className="mt-1.5 text-[11px] text-copy-faint">
          Enter to send · Shift+Enter for a new line
        </p>
      </div>
    </div>
  );
}
