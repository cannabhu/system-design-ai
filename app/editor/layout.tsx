import { Suspense, type ReactNode } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";

import { EditorShell } from "@/components/editor/editor-shell";
import { getOwnedProjects, getSharedProjects } from "@/lib/project-queries";

async function ProtectedEditor({ children }: { children: ReactNode }) {
  const { userId } = await auth.protect();
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;

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
