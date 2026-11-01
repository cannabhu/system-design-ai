import Link from "next/link";
import { Lock } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AccessDenied() {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <Lock className="h-8 w-8 text-copy-faint" />
      <h1 className="text-xl font-semibold text-copy-primary">Access denied</h1>
      <p className="max-w-md text-sm text-copy-muted">
        This project doesn&apos;t exist or you don&apos;t have permission to
        view it.
      </p>
      <Link
        href="/editor"
        className={cn(buttonVariants({ variant: "outline" }))}
      >
        Back to editor
      </Link>
    </main>
  );
}
