import type { CSSProperties, ReactNode } from "react";

type MarqueeProps = {
  /** Accessible name for the (first, non-hidden) list. */
  label: string;
  /** Seconds for one full loop. */
  duration: number;
  reverse?: boolean;
  /** `<li>` items; rendered twice, the second copy is `aria-hidden`. */
  children: ReactNode;
  className?: string;
};

/** Pure-CSS infinite marquee. Items must be `<li>` with `flex-shrink-0`. */
export function Marquee({ label, duration, reverse = false, children, className }: MarqueeProps) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      data-reverse={reverse}
      className={`marquee rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${className ?? ""}`}
      style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
    >
      <div className="marquee-track">
        <ul role="list" aria-label={label} className="marquee-list">
          {children}
        </ul>
        <ul role="list" aria-hidden="true" className="marquee-list marquee-dupe">
          {children}
        </ul>
      </div>
    </div>
  );
}
