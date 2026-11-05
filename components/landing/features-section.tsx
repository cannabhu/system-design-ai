import {
  Check,
  Code2,
  FileText,
  LayoutTemplate,
  Rocket,
  Save,
  Shapes,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LANDING_CONTAINER } from "./landing-links";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

/* ---------- tiny CSS/SVG visuals ---------- */

function CollabVisual() {
  const people = [
    { initials: "AB", cls: "bg-brand text-primary-foreground" },
    { initials: "KO", cls: "bg-ai text-copy-primary" },
    { initials: "MJ", cls: "bg-state-success text-primary-foreground" },
  ];
  return (
    <div className="mt-6 flex flex-wrap items-center gap-4" aria-hidden="true">
      <div className="flex -space-x-2">
        {people.map((p) => (
          <span
            key={p.initials}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface text-[10px] font-semibold",
              p.cls
            )}
          >
            {p.initials}
          </span>
        ))}
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-ai px-2.5 py-1 text-[11px] font-medium text-copy-primary">
        <svg viewBox="0 0 12 12" className="h-3 w-3 fill-current" aria-hidden="true">
          <path d="M1 1l9 3.5-3.8 1.3L4.8 10z" />
        </svg>
        Kemi
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-state-success px-2.5 py-1 text-[11px] font-medium text-primary-foreground">
        <svg viewBox="0 0 12 12" className="h-3 w-3 fill-current" aria-hidden="true">
          <path d="M1 1l9 3.5-3.8 1.3L4.8 10z" />
        </svg>
        Mo
      </span>
    </div>
  );
}

function AiVisual() {
  return (
    <svg viewBox="0 0 160 64" className="mt-6 h-16 w-full max-w-48" aria-hidden="true">
      <path d="M36 32h28M96 32h28" className="stroke-surface-border-subtle" strokeWidth="1.5" fill="none" />
      <rect x="4" y="18" width="32" height="28" rx="8" className="fill-surface stroke-ai-text" strokeWidth="1.5" />
      <rect x="64" y="18" width="32" height="28" rx="8" className="fill-surface stroke-ai-text" strokeWidth="1.5" />
      <rect x="124" y="18" width="32" height="28" rx="8" className="fill-ai/20 stroke-ai-text" strokeWidth="1.5" strokeDasharray="3 3" />
    </svg>
  );
}

function SpecVisual() {
  return (
    <pre
      className="mt-6 overflow-hidden rounded-xl border border-surface-border bg-base p-3 font-mono text-[11px] leading-relaxed text-copy-muted"
      aria-hidden="true"
    >
      <span className="text-brand"># API Gateway</span>
      {"\n"}
      <span className="text-copy-faint">- </span>Routes requests
      {"\n"}
      <span className="text-copy-faint">- </span>Calls Auth service
    </pre>
  );
}

function ShapesVisual() {
  const common = "fill-none stroke-brand";
  return (
    <svg viewBox="0 0 168 24" className="mt-6 h-6 w-full max-w-44" aria-hidden="true">
      <rect x="1" y="4" width="20" height="16" rx="2" className={common} strokeWidth="1.5" />
      <path d="M38 2l10 10-10 10-10-10z" className={common} strokeWidth="1.5" />
      <circle cx="64" cy="12" r="9" className={common} strokeWidth="1.5" />
      <rect x="82" y="5" width="24" height="14" rx="7" className={common} strokeWidth="1.5" />
      <path d="M118 6v12c0 2 4 3 7 3s7-1 7-3V6c0-2-4-3-7-3s-7 1-7 3z" className={common} strokeWidth="1.5" />
      <path d="M144 12l5-9h10l5 9-5 9h-10z" className={common} strokeWidth="1.5" />
    </svg>
  );
}

function AutosaveVisual() {
  return (
    <span
      className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-surface-border bg-base px-2.5 py-1 text-[11px] font-medium text-copy-secondary"
      aria-hidden="true"
    >
      <Check className="h-3 w-3 text-state-success" />
      All changes saved
    </span>
  );
}

function TemplatesVisual() {
  const names = ["Microservices", "CI/CD Pipeline", "Event-Driven System"];
  return (
    <ul className="mt-6 flex flex-wrap gap-2" aria-hidden="true">
      {names.map((n) => (
        <li
          key={n}
          className="rounded-full border border-surface-border bg-base px-3 py-1 text-[11px] font-medium text-copy-secondary"
        >
          {n}
        </li>
      ))}
    </ul>
  );
}

/* ---------- content ---------- */

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  visual: ReactNode;
  ai?: boolean;
  className?: string;
};

const FEATURES: Feature[] = [
  {
    icon: Users,
    title: "Real-time collaboration",
    description:
      "Live cursors, presence avatars and one shared canvas, so everyone edits the same diagram instead of passing screenshots around.",
    visual: <CollabVisual />,
    className: "sm:col-span-2",
  },
  {
    icon: Sparkles,
    title: "AI design agent",
    description:
      "Describe a system and watch nodes and edges appear. No more staring at a blank canvas.",
    visual: <AiVisual />,
    ai: true,
  },
  {
    icon: FileText,
    title: "Spec generation",
    description:
      "Turn the diagram into a downloadable Markdown spec, without writing the docs by hand.",
    visual: <SpecVisual />,
  },
  {
    icon: Shapes,
    title: "Rich node shapes",
    description:
      "Rectangle, diamond, circle, pill, cylinder and hexagon, with a color palette that keeps diagrams readable.",
    visual: <ShapesVisual />,
  },
  {
    icon: Save,
    title: "Autosave and sharing",
    description:
      "The canvas saves itself and you can share a project with teammates, so nothing gets lost.",
    visual: <AutosaveVisual />,
  },
  {
    icon: LayoutTemplate,
    title: "Starter templates",
    description:
      "Begin from a proven template instead of a blank canvas and adapt it to your system.",
    visual: <TemplatesVisual />,
    className: "sm:col-span-2 lg:col-span-3",
  },
];

const AUDIENCES: { icon: LucideIcon; title: string; pain: string }[] = [
  {
    icon: Users,
    title: "Engineering teams",
    pain: "Stop debating architecture over scattered docs and screenshots.",
  },
  {
    icon: Rocket,
    title: "Startup founders",
    pain: "Get from idea to a shareable technical plan without a week of diagramming.",
  },
  {
    icon: User,
    title: "Solo developers",
    pain: "Turn rough ideas into a clear design and spec without a team to review it.",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="relative bg-base py-20 md:py-28"
    >
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-surface-border/60" />
      <div className={LANDING_CONTAINER}>
        <Reveal variant="slide-down">
          <SectionHeading
            id="features-heading"
            label="Features"
            title="Less whiteboard chaos, more shipped architecture"
            description="Everything your team needs to design, review and document a system in one place."
          />
        </Reveal>

        <ul className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal
              as="li"
              variant="zoom"
              key={f.title}
              delay={(i % 3) * 100}
              className={cn("flex", f.className)}
            >
              <article className="group relative w-full overflow-hidden rounded-2xl border border-surface-border bg-surface p-6 transition-colors duration-300 hover:border-surface-border-subtle motion-reduce:transition-none">
                <div
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:transition-none",
                    f.ai
                      ? "bg-[radial-gradient(70%_60%_at_50%_0%,color-mix(in_srgb,var(--accent-ai)_15%,transparent),transparent)]"
                      : "bg-[radial-gradient(70%_60%_at_50%_0%,var(--accent-primary-dim),transparent)]"
                  )}
                />
                <div className="relative">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      f.ai ? "bg-ai/15 text-ai-text" : "bg-accent-dim text-brand"
                    )}
                  >
                    <f.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-copy-primary">{f.title}</h3>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-copy-muted">
                    {f.description}
                  </p>
                  {f.visual}
                </div>
              </article>
            </Reveal>
          ))}
        </ul>

        <Reveal variant="fade">
          <div className="mt-16 md:mt-20">
            <h3 className="flex items-center justify-center gap-2 text-center text-sm font-medium uppercase tracking-widest text-copy-muted">
              <Code2 className="h-4 w-4 text-brand" aria-hidden="true" />
              Built for
            </h3>
            <ul className="mt-6 grid gap-4 md:grid-cols-3 md:gap-6">
              {AUDIENCES.map((a) => (
                <li
                  key={a.title}
                  className="rounded-2xl border border-surface-border bg-surface/60 p-5 text-center"
                >
                  <a.icon className="mx-auto h-5 w-5 text-brand" aria-hidden="true" />
                  <p className="mt-3 text-base font-semibold text-copy-primary">{a.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-copy-muted">{a.pain}</p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
