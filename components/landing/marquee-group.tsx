"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";

/**
 * Owns the shared motion state for the marquee rows: runs the animation only
 * while the group is in view, and exposes a visible Pause/Play toggle. The CSS
 * in `globals.css` reads `data-inview` / `data-paused`.
 */
export function MarqueeGroup({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="marquee-group"
      data-inview={inView}
      data-paused={paused}
    >
      {children}
      <div className="mt-8 flex justify-center motion-reduce:hidden">
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-surface-border bg-surface px-4 text-sm text-copy-secondary transition-colors hover:text-copy-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {paused ? (
            <Play className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Pause className="h-4 w-4" aria-hidden="true" />
          )}
          {paused ? "Play motion" : "Pause motion"}
        </button>
      </div>
    </div>
  );
}
