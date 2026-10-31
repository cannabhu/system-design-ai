import { Suspense, type ReactNode } from "react";
import { auth } from "@clerk/nextjs/server";

import { EditorShell } from "@/components/editor/editor-shell";

async function ProtectedEditor({ children }: { children: ReactNode }) {
  await auth.protect();

  return <EditorShell>{children}</EditorShell>;
}

export default function EditorLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <ProtectedEditor>{children}</ProtectedEditor>
    </Suspense>
  );
}
