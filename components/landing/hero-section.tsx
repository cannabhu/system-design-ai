import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { HeroCtas } from "./hero-ctas";
import { HeroPreview } from "./hero-preview";
import { LANDING_CONTAINER } from "./landing-links";

export function HeroSection() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden bg-base"
    >
      {/* Background: dot grid, glows, hairlines, bottom fade */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="hero-grid absolute inset-0" />
        <div className="absolute left-1/2 top-[55%] h-[38rem] w-[min(70rem,140vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-dim blur-3xl" />
        <div className="absolute left-[8%] top-[20%] h-72 w-72 rounded-full bg-ai/10 blur-3xl" />
        <div className="absolute inset-x-0 top-24 h-px bg-surface-border/60" />
        <div className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-surface-border/40 lg:block" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-base" />
      </div>

      <div
        className={cn(
          LANDING_CONTAINER,
          "flex flex-col items-center pb-20 pt-16 text-center sm:pt-20 lg:pt-24"
        )}
      >
        <p className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface px-3.5 py-1.5 text-xs font-medium text-copy-secondary">
          <Sparkles className="size-3.5 text-ai-text" aria-hidden="true" />
          AI-powered system design
        </p>

        <h1
          id="hero-heading"
          className="mt-6 max-w-4xl text-balance text-[clamp(2.25rem,6vw+0.5rem,4.5rem)] font-semibold leading-[1.05] tracking-tight text-copy-primary"
        >
          Design systems together.{" "}
          <span className="text-brand">Ship the spec in minutes.</span>
        </h1>

        <p className="mt-5 max-w-2xl text-balance text-base leading-relaxed text-copy-secondary sm:text-lg">
          Sketch on a real-time collaborative canvas, let AI generate the
          architecture, and export a ready-to-use spec.
        </p>

        <div className="mt-8 flex w-full flex-col items-center gap-4">
          <HeroCtas />
          <p className="text-sm text-copy-muted">
            Free to start · No credit card
          </p>
        </div>

        <div className="hero-preview-wrap mt-14 w-full sm:mt-16">
          <HeroPreview />
        </div>
      </div>
    </section>
  );
}
