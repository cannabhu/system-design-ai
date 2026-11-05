import Link from "next/link";
import { Sparkles } from "lucide-react";

export function LandingLogo() {
  return (
    <Link
      href="/"
      className="flex min-h-11 items-center gap-2 rounded-xl text-lg font-semibold text-copy-primary outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ai text-copy-primary">
        <Sparkles className="h-4 w-4" />
      </span>
      Grand AI
    </Link>
  );
}
