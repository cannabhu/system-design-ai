import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";

import { EditorShell } from "@/components/editor/editor-shell";
import { getCurrentIdentity } from "@/lib/project-access";
import { getOwnedProjects, getSharedProjects } from "@/lib/project-queries";

export const metadata: Metadata = {
  title: "Editor",
  robots: { index: false, follow: false },
};

async function ProtectedEditor({ children }: { children: ReactNode }) {
  // Resource-level auth check (replaces the proxy.ts route matcher). It runs
  // inside <Suspense> so the redirect never throws during the static shell.
  const identity = await getCurrentIdentity();
  if (!identity) redirect("/sign-in");
  const { userId, email } = identity;

  const [ownedProjects, sharedProjects] = await Promise.all([
    getOwnedProjects(userId),
    email ? getSharedProjects(email) : [],
  ]);

  return (
    <EditorShell
      ownedProjects={ownedProjects}
      sharedProjects={sharedProjects}
    >
      {children}
    </EditorShell>
  );
}

export default function EditorLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <ProtectedEditor>{children}</ProtectedEditor>
    </Suspense>
  );
}
