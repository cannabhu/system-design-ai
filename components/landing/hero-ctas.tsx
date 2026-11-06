import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0";
const base = cn("h-12 w-full px-6 text-base sm:w-auto", focusRing);

function CtaRow({ primaryHref }: { primaryHref: string }) {
  return (
    <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
      <Link href={primaryHref} className={cn(buttonVariants(), base)}>
        Start designing
      </Link>
      <a
        href="#about"
        className={cn(
          buttonVariants({ variant: "outline" }),
          base,
          "text-white hover:text-white",
        )}
      >
        See how it works
      </a>
    </div>
  );
}

async function AuthCtas() {
  const { userId } = await auth();
  return <CtaRow primaryHref={userId ? "/editor" : "/sign-up"} />;
}

// Same auth behaviour as the navbar: signed-out until auth resolves, so the
// rest of the hero stays static.
export function HeroCtas() {
  return (
    <Suspense fallback={<CtaRow primaryHref="/sign-up" />}>
      <AuthCtas />
    </Suspense>
  );
}
