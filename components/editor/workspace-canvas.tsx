import { Workflow } from "lucide-react";

export function WorkspaceCanvas({ projectName }: { projectName: string }) {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-2 bg-base px-6 text-center">
      <Workflow className="h-8 w-8 text-copy-faint" />
      <p className="text-sm font-medium text-copy-secondary">{projectName}</p>
      <p className="text-xs text-copy-muted">Canvas coming soon</p>
    </main>
  );
}
