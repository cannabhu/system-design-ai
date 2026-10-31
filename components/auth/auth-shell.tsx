import type { ReactNode } from "react";

export const authFormAppearance = {
  elements: {
    cardBox: "w-full max-w-sm shadow-none border-0 bg-transparent",
    card: "bg-transparent shadow-none border-0 p-0",
    headerTitle: "text-2xl font-semibold tracking-tight",
    formButtonPrimary:
      "shadow-[0_0_28px_var(--accent-primary-dim)] hover:shadow-[0_0_36px_var(--accent-primary-dim)]",
  },
};

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen flex-1 bg-base lg:grid-cols-2">
      <aside className="relative hidden flex-col overflow-hidden border-r border-surface-border bg-surface p-12 text-copy-primary lg:flex">
        <h1 className="relative max-w-md text-5xl font-medium uppercase leading-[1.1] tracking-tight">
          Turn your ideas into working architecture.
        </h1>
        <p className="relative mt-6 max-w-sm text-sm text-copy-muted">
          Describe a system, refine it with your team on a shared canvas, and
          generate the spec.
        </p>
        <div aria-hidden className="absolute -bottom-40 left-1/2 -translate-x-1/2">
          <div className="flex h-[32rem] w-[32rem] items-center justify-center rounded-full bg-ai/10">
            <div className="flex h-96 w-96 items-center justify-center rounded-full bg-ai/20">
              <div className="h-60 w-60 rounded-full bg-ai shadow-[0_0_80px_var(--accent-ai)]" />
            </div>
          </div>
        </div>
        <span className="relative mt-auto text-sm font-semibold">Grand AI</span>
      </aside>
      <section className="flex items-center justify-center bg-base px-4 py-8">
        <div className="flex w-full max-w-sm flex-col items-center gap-6">
          <span className="text-lg font-semibold text-copy-primary lg:hidden">
            Grand AI
          </span>
          {children}
        </div>
      </section>
    </main>
  );
}
