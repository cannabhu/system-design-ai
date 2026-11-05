import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";

/** Placeholder node box with a staggered pulse. */
function GhostNode({
  className,
  delay,
}: {
  className: string;
  delay: string;
}) {
  return (
    <div
      aria-hidden
      style={{ animationDelay: delay }}
      className={`absolute rounded-xl border border-surface-border bg-surface/80 motion-safe:animate-pulse ${className}`}
    >
      <div className="m-3 h-1.5 w-1/2 rounded-full bg-subtle" />
      <div className="m-3 mt-0 h-1.5 w-1/3 rounded-full bg-subtle" />
    </div>
  );
}

/**
 * Full-area loading state shown while a project opens: a ghost diagram on a
 * dotted grid with a centered status card. Server-safe (no hooks).
 */
export function CanvasLoading({
  label = "Opening your canvas",
  hint = "Connecting to your workspace…",
}: {
  label?: string;
  hint?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="relative flex h-full items-center justify-center overflow-hidden bg-base px-6"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-60 [background-image:radial-gradient(var(--border-default)_1px,transparent_1px)] [background-size:24px_24px]"
      />
      <div
        aria-hidden
        className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_0%,var(--bg-base)_75%)]"
      />

      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 hidden h-72 w-[34rem] -translate-x-1/2 -translate-y-1/2 opacity-70 sm:block"
      >
        <GhostNode className="top-0 left-0 h-16 w-40" delay="0ms" />
        <GhostNode className="top-0 right-0 h-16 w-40" delay="300ms" />
        <GhostNode className="bottom-0 left-1/2 h-16 w-40 -translate-x-1/2" delay="600ms" />
        <svg
          className="absolute inset-0 h-full w-full text-surface-border-subtle"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        >
          <path d="M160 32 H 374" />
          <path d="M80 64 V 150 H 200 V 208" />
          <path d="M454 64 V 150 H 340 V 208" />
        </svg>
      </div>

      <div className="relative flex w-full max-w-xs flex-col items-center gap-4 rounded-3xl border border-surface-border bg-surface/90 px-6 py-8 text-center shadow-2xl backdrop-blur-md">
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-dim text-brand">
          <Loader2 className="h-6 w-6 motion-safe:animate-spin" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-copy-primary">{label}</p>
          <p className="text-xs text-copy-muted">{hint}</p>
        </div>
        <div
          aria-hidden
          className="h-1 w-full overflow-hidden rounded-full bg-subtle"
        >
          <div className="h-full w-1/3 rounded-full bg-brand motion-safe:animate-[canvas-load_1.4s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}

export function CanvasError() {
  return (
    <div
      role="alert"
      className="flex h-full items-center justify-center bg-base px-6"
    >
      <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-3xl border border-surface-border bg-surface px-6 py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-state-error/15 text-state-error">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-copy-primary">
            Couldn&apos;t connect to the canvas
          </p>
          <p className="text-xs text-copy-muted">
            Check your connection and try again.
          </p>
        </div>
        <a
          href=""
          className="inline-flex h-8 items-center gap-2 rounded-lg border border-surface-border-subtle px-3 text-sm text-copy-primary transition-colors hover:bg-subtle"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </a>
      </div>
    </div>
  );
}
