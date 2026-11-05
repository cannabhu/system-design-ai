import type { ReactNode } from "react";
import { Cpu, Database, Globe, Layers, Sparkles, Users } from "lucide-react";

export const authFormAppearance = {
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox:
      "w-full max-w-sm mx-auto shadow-none border-0 bg-transparent overflow-visible",
    card: "w-full bg-transparent shadow-none border-0 p-0 gap-6",
    header: "w-full items-center text-center",
    main: "w-full gap-6",
    form: "w-full",
    socialButtons: "w-full",
    socialButtonsBlockButton__last: "w-full",
    footer:
      "w-full bg-none bg-transparent p-0 mt-2 flex flex-col items-center justify-center text-center",
    footerAction:
      "w-full m-0 p-0 flex flex-row flex-wrap items-center justify-center gap-x-1 text-center",
    footerActionText: "text-copy-muted m-0 text-center",
    footerPages: "w-full justify-center",
    headerTitle: "text-2xl font-semibold tracking-tight",
    headerSubtitle: "text-copy-muted",
    socialButtonsBlockButton:
      "rounded-xl border-surface-border bg-surface hover:bg-elevated transition-colors h-10",
    formFieldInput:
      "rounded-xl h-10 border-surface-border bg-surface focus:border-brand transition-colors",
    formFieldLabel: "text-copy-secondary",
    formButtonPrimary:
      "rounded-xl h-10 shadow-[0_0_28px_var(--accent-primary-dim)] hover:shadow-[0_0_36px_var(--accent-primary-dim)] transition-shadow",
    footerActionLink: "text-brand hover:text-brand/80",
    dividerLine: "bg-surface-border",
    dividerText: "text-copy-faint",
  },
};

const FEATURES = [
  { icon: Sparkles, label: "Generate architecture from a prompt" },
  { icon: Users, label: "Refine together on a shared canvas" },
  { icon: Layers, label: "Export a complete system spec" },
];

function DiagramNode({
  icon: Icon,
  label,
  className = "",
  ai = false,
}: {
  icon: typeof Globe;
  label: string;
  className?: string;
  ai?: boolean;
}) {
  return (
    <div
      className={`absolute flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium backdrop-blur ${
        ai
          ? "border-ai/50 bg-ai/15 text-ai-text shadow-[0_0_32px_var(--accent-ai)]/30"
          : "border-surface-border bg-elevated text-copy-secondary"
      } ${className}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </div>
  );
}

function ArchitectureIllustration() {
  return (
    <div aria-hidden className="relative h-64 w-full max-w-md">
      <svg
        className="absolute inset-0 h-full w-full text-surface-border-subtle"
        viewBox="0 0 400 256"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      >
        <path d="M110 48 H200 V128" />
        <path d="M200 128 H290 V48" />
        <path d="M200 128 V208" />
      </svg>
      <DiagramNode icon={Globe} label="Client" className="left-2 top-4" />
      <DiagramNode icon={Cpu} label="API" className="right-2 top-4" />
      <DiagramNode
        icon={Sparkles}
        label="AI Spec"
        ai
        className="left-1/2 top-[6.5rem] -translate-x-1/2"
      />
      <DiagramNode
        icon={Database}
        label="Database"
        className="bottom-2 left-1/2 -translate-x-1/2"
      />
    </div>
  );
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-base p-4 sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-[48rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ai/20 blur-3xl"
      />
      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-surface-border bg-surface lg:min-h-[640px] lg:grid-cols-2">
        <aside className="relative hidden flex-col gap-8 overflow-hidden border-r border-surface-border bg-elevated/40 p-10 text-copy-primary lg:flex">
          <span className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ai text-copy-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            Grand AI
          </span>

          <div>
            <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight">
              Turn your ideas into{" "}
              <span className="text-brand">working architecture.</span>
            </h1>
            <p className="mt-4 max-w-sm text-sm text-copy-muted">
              Describe a system, refine it with your team, and generate the
              spec.
            </p>
          </div>

          <div className="flex flex-1 items-center">
            <ArchitectureIllustration />
          </div>

          <ul className="flex flex-col gap-3">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-3 text-sm text-copy-secondary"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-surface-border bg-surface text-brand">
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </aside>

        <section className="flex flex-col items-center justify-center gap-6 px-5 py-8 sm:px-10 sm:py-10">
          <span className="flex items-center gap-2 text-lg font-semibold text-copy-primary lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ai">
              <Sparkles className="h-4 w-4" />
            </span>
            Grand AI
          </span>
          <div className="flex w-full max-w-sm flex-col items-center justify-center">
            {children}
          </div>
          <p className="text-xs text-copy-faint">
            &copy; Grand AI. All rights reserved.
          </p>
        </section>
      </div>
    </main>
  );
}
