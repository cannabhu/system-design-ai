"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { LANDING_CONTAINER, LANDING_NAV_LINKS } from "./landing-links";
import { LandingLogo } from "./landing-logo";

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0";

function ActionLink({
  href,
  className,
  closeOnClick,
  children,
}: {
  href: string;
  className: string;
  closeOnClick: boolean;
  children: ReactNode;
}) {
  if (closeOnClick) {
    return (
      <SheetClose render={<Link href={href} className={className} />}>
        {children}
      </SheetClose>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function Actions({
  signedIn,
  stacked = false,
}: {
  signedIn: boolean;
  stacked?: boolean;
}) {
  const base = cn("h-11 px-4 md:h-9", focusRing, stacked && "w-full");
  const primary = cn(buttonVariants(), base);
  const ghost = cn(buttonVariants({ variant: "ghost" }), base);

  if (signedIn) {
    return (
      <ActionLink href="/editor" className={primary} closeOnClick={stacked}>
        Open editor
      </ActionLink>
    );
  }
  return (
    <>
      <ActionLink href="/sign-in" className={ghost} closeOnClick={stacked}>
        Sign in
      </ActionLink>
      <ActionLink href="/sign-up" className={primary} closeOnClick={stacked}>
        Get started
      </ActionLink>
    </>
  );
}

export function LandingNavbar({ signedIn = false }: { signedIn?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-base/70 backdrop-blur-md transition-colors motion-reduce:transition-none",
        scrolled ? "border-surface-border" : "border-transparent"
      )}
    >
      <div
        className={cn(LANDING_CONTAINER, "flex h-16 items-center justify-between gap-4")}
      >
        <LandingLogo />

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {LANDING_NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-xl px-3 py-2 text-sm text-copy-muted transition-colors hover:text-copy-primary",
                focusRing
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Actions signedIn={signedIn} />
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                aria-label="Open menu"
                className="size-11 md:hidden"
              />
            }
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent
            side="right"
            className="border-surface-border bg-base text-copy-primary"
          >
            <div className="flex flex-col gap-1 px-4 pt-14">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">
                Navigate the Grand AI landing page
              </SheetDescription>
              {LANDING_NAV_LINKS.map((link) => (
                <SheetClose
                  key={link.href}
                  render={
                    <a
                      href={link.href}
                      className={cn(
                        "flex min-h-11 items-center rounded-xl px-3 text-base text-copy-secondary hover:bg-surface hover:text-copy-primary",
                        focusRing
                      )}
                    />
                  }
                >
                  {link.label}
                </SheetClose>
              ))}
            </div>
            <div className="mt-2 flex flex-col gap-2 border-t border-surface-border p-4">
              <Actions signedIn={signedIn} stacked />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
