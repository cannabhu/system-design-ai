import { Suspense, type ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";

import { EditorShell } from "@/components/editor/editor-shell";
import { getCurrentIdentity } from "@/lib/project-access";
import { getOwnedProjects, getSharedProjects } from "@/lib/project-queries";

async function ProtectedEditor({ children }: { children: ReactNode }) {
  // Redirecting unauthenticated users happens in proxy.ts; this is only a guard.
  const { userId: authedUserId } = await auth();
  if (!authedUserId) return null;
  const identity = await getCurrentIdentity();
  if (!identity) return null;
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
