"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Bot, SendHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const STARTER_PROMPTS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
];

const MAX_TEXTAREA_HEIGHT = 160;

export function AiArchitectTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
  }, [input]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  function submit() {
    const content = input.trim();
    if (!content) return;
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", content },
    ]);
    setInput("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  function pickStarter(prompt: string) {
    setInput(prompt);
    textareaRef.current?.focus();
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScrollArea className="min-h-0 flex-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <Bot className="h-8 w-8 text-ai-text" />
            <p className="text-sm font-medium text-copy-secondary">
              Describe a system to design
            </p>
            <p className="text-xs text-copy-muted">
              Ask Ghost AI to sketch an architecture, then refine it together on
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
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm break-words whitespace-pre-wrap",
                  message.role === "user"
                    ? "self-end border-2 border-brand/50 bg-accent-dim text-copy-primary"
                    : "self-start border border-surface-border bg-elevated text-ai-text",
                )}
              >
                {message.content}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      <div className="shrink-0 border-t border-surface-border p-3">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your system…"
            aria-label="Message Ghost AI"
            rows={1}
            className="field-sizing-fixed min-h-[72px] max-h-40 resize-none overflow-y-auto border-surface-border bg-surface py-2 pr-12 text-sm text-copy-primary"
          />
          <Button
            size="icon-sm"
            onClick={submit}
            disabled={!input.trim()}
            aria-label="Send message"
            className="absolute right-2 bottom-2 bg-ai text-white hover:bg-ai/90"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1.5 text-[11px] text-copy-faint">
          Enter to send · Shift+Enter for a new line
        </p>
      </div>
    </div>
  );
}
