"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

export type RevealVariant =
  | "fade-up"
  | "fade"
  | "slide-left"
  | "slide-right"
  | "slide-down"
  | "zoom"
  | "blur";

type RevealProps = {
  /** Entrance animation. Defaults to "fade-up". */
  variant?: RevealVariant;
  children: ReactNode;
  as?: "div" | "li";
  /** Stagger delay in ms. */
  delay?: number;
  className?: string;
};

/**
 * Scroll-triggered entrance (fade, slide, zoom, blur), once per element. Content is visible by default (SSR, no
 * JS, reduced motion); the hidden state is only applied after mount for
 * elements that start below the fold.
 */
export function Reveal({ children, as: Tag = "div", delay = 0, variant = "fade-up", className }: RevealProps) {
  const ref = useRef<HTMLDivElement & HTMLLIElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.dataset.reveal = "hidden";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.reveal = "shown";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={className}
      data-reveal-variant={variant}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
