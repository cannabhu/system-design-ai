import Link from "next/link";
import { cacheLife } from "next/cache";
import { cn } from "@/lib/utils";
import { LANDING_CONTAINER, LANDING_NAV_LINKS } from "./landing-links";
import { LandingLogo } from "./landing-logo";

async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

const linkClass =
  "inline-flex min-h-11 items-center rounded-xl text-sm text-copy-muted transition-colors hover:text-copy-primary outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-0 sm:py-1";

export function LandingFooter() {
  return (
    <footer className="border-t border-surface-border bg-base">
      <div className={cn(LANDING_CONTAINER, "py-10")}>
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <LandingLogo />
            <p className="mt-2 text-sm text-copy-muted">
              Describe a system, refine it with your team, and generate the
              spec.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:gap-16">
            <nav aria-label="Product">
              <h3 className="text-sm font-medium text-copy-primary">Product</h3>
              <ul className="mt-2 flex flex-col">
                {LANDING_NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className={linkClass}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Account">
              <h3 className="text-sm font-medium text-copy-primary">Account</h3>
              <ul className="mt-2 flex flex-col">
                <li>
                  <Link href="/sign-in" className={linkClass}>
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link href="/sign-up" className={linkClass}>
                    Get started
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-10 border-t border-surface-border pt-6">
          <p className="text-xs text-copy-faint">
            &copy; <CurrentYear /> Grand AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
