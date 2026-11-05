"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Download, FileText, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { SpecItem } from "@/components/editor/specs-tab";

interface SpecPreviewDialogProps {
  projectId: string;
  spec: SpecItem | null;
  onClose: () => void;
}

type Content =
  | { specId: string; status: "ready"; markdown: string }
  | { specId: string; status: "error" };

export function SpecPreviewDialog({
  projectId,
  spec,
  onClose,
}: SpecPreviewDialogProps) {
  const [content, setContent] = useState<Content | null>(null);
  const specId = spec?.id;

  useEffect(() => {
    if (!specId) return;
    const controller = new AbortController();

    fetch(`/api/projects/${projectId}/specs/${specId}/download`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Request failed");
        const markdown = await res.text();
        setContent({ specId, status: "ready", markdown });
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setContent({ specId, status: "error" });
      });

    // Content is dropped as soon as the modal closes or switches spec.
    return () => {
      controller.abort();
      setContent(null);
    };
  }, [projectId, specId]);

  const current = content && content.specId === specId ? content : null;

  return (
    <Dialog open={spec !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-3 rounded-3xl border border-surface-border bg-surface p-6 shadow-2xl ring-0 sm:max-w-2xl">
        <DialogHeader className="flex-row items-start gap-3 pr-8">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ai/15 text-ai-text">
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <DialogTitle className="truncate text-base leading-snug font-semibold text-copy-primary">
              {spec?.filename}
            </DialogTitle>
            <DialogDescription className="text-sm text-copy-muted">
              {spec ? new Date(spec.createdAt).toLocaleString() : ""}
            </DialogDescription>
          </div>
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-1 rounded-2xl border border-surface-border bg-base">
          <div className="max-h-[55vh] p-4 text-sm text-copy-secondary">
            {!current && (
              <div className="flex items-center gap-2 text-copy-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading spec…
              </div>
            )}
            {current?.status === "error" && (
              <p className="flex items-center gap-2 text-state-error">
                <AlertCircle className="h-4 w-4" />
                Could not load this spec.
              </p>
            )}
            {current?.status === "ready" && (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: (p) => <h1 className="mt-4 mb-2 text-xl font-semibold text-copy-primary first:mt-0" {...p} />,
                  h2: (p) => <h2 className="mt-4 mb-2 text-lg font-semibold text-copy-primary first:mt-0" {...p} />,
                  h3: (p) => <h3 className="mt-3 mb-1.5 text-base font-semibold text-copy-primary" {...p} />,
                  p: (p) => <p className="my-2 leading-relaxed" {...p} />,
                  ul: (p) => <ul className="my-2 list-disc pl-5" {...p} />,
                  ol: (p) => <ol className="my-2 list-decimal pl-5" {...p} />,
                  li: (p) => <li className="my-0.5" {...p} />,
                  a: (p) => <a className="text-brand underline" target="_blank" rel="noreferrer" {...p} />,
                  code: (p) => <code className="rounded bg-subtle px-1 py-0.5 font-mono text-xs" {...p} />,
                  pre: (p) => <pre className="my-2 overflow-x-auto rounded-xl bg-subtle p-3 font-mono text-xs" {...p} />,
                  table: (p) => <table className="my-2 w-full border-collapse text-xs" {...p} />,
                  th: (p) => <th className="border border-surface-border px-2 py-1 text-left text-copy-primary" {...p} />,
                  td: (p) => <td className="border border-surface-border px-2 py-1" {...p} />,
                  blockquote: (p) => <blockquote className="my-2 border-l-2 border-surface-border pl-3 text-copy-muted" {...p} />,
                }}
              >
                {current.markdown}
              </ReactMarkdown>
            )}
          </div>
        </ScrollArea>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-copy-muted hover:bg-subtle hover:text-copy-primary"
          >
            Close
          </Button>
          {spec && (
            <Button
              nativeButton={false}
              render={
                <a
                  href={`/api/projects/${projectId}/specs/${spec.id}/download`}
                  download
                />
              }
              className="bg-ai text-white hover:bg-ai/90"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
