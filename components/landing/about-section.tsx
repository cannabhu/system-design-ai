import { Download, MessageSquareText, Sparkles, Users, Workflow, FileText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { LANDING_CONTAINER } from "./landing-links";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

const STEPS: { icon: LucideIcon; title: string; description: string; ai?: boolean }[] = [
  {
    icon: MessageSquareText,
    title: "Describe",
    description: "Tell the AI what you are building, in plain English.",
  },
  {
    icon: Workflow,
    title: "Design",
    description: "AI lays out nodes and edges on a shared canvas, and your team edits together.",
    ai: true,
  },
  {
    icon: Download,
    title: "Export",
    description: "Generate a Markdown spec from the diagram and download it.",
  },
];

const CHIPS: { icon: LucideIcon; label: string; ai?: boolean }[] = [
  { icon: Users, label: "Real-time collaboration" },
  { icon: Sparkles, label: "AI generation", ai: true },
  { icon: FileText, label: "Spec export" },
];

export function AboutSection() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="bg-base py-20 md:py-28"
    >
      <div className={LANDING_CONTAINER}>
        <Reveal variant="blur">
          <SectionHeading
            id="about-heading"
            label="What is Grand AI"
            title="One workspace from idea to architecture spec"
            description="Grand AI is a real-time collaborative system design workspace where AI generates the architecture and the spec, and your team refines it together."
          />
        </Reveal>

        <div className="mx-auto mt-14 max-w-5xl">
          <h3 className="sr-only">How it works</h3>
          <ol className="grid gap-4 md:grid-cols-3 md:gap-6">
            {STEPS.map((step, i) => (
              <Reveal as="li" variant="slide-left" key={step.title} delay={i * 150} className="relative">
                <div className="h-full rounded-2xl border border-surface-border bg-surface p-6">
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        step.ai ? "bg-ai/15 text-ai-text" : "bg-accent-dim text-brand"
                      )}
                    >
                      <step.icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="font-mono text-sm text-copy-faint" aria-hidden="true">
                      0{i + 1}
                    </span>
                  </div>
                  <h4 className="mt-5 text-lg font-semibold text-copy-primary">
                    <span className="sr-only">Step {i + 1}: </span>
                    {step.title}
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-copy-muted">
                    {step.description}
                  </p>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="absolute left-full top-11 z-10 hidden w-6 -translate-y-1/2 border-t border-dashed border-surface-border-subtle md:block"
                  />
                )}
              </Reveal>
            ))}
          </ol>

          <Reveal variant="zoom" delay={300}>
            <ul className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {CHIPS.map((chip) => (
                <li
                  key={chip.label}
                  className="inline-flex items-center gap-2 rounded-full border border-surface-border bg-surface px-3.5 py-1.5 text-xs font-medium text-copy-secondary"
                >
                  <chip.icon
                    className={cn("h-3.5 w-3.5", chip.ai ? "text-ai-text" : "text-brand")}
                    aria-hidden="true"
                  />
                  {chip.label}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
