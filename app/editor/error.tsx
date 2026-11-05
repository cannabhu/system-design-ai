"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function EditorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-base px-4 text-center text-copy-primary">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="max-w-sm text-sm text-copy-muted">
        An unexpected error occurred. It has been reported.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-xl border border-surface-border bg-surface px-4 py-2 text-sm text-copy-primary transition-colors hover:bg-elevated"
      >
        Try again
      </button>
    </div>
  );
}
