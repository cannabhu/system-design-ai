import {
  Box,
  Cloud,
  Hexagon,
  Layers,
  Orbit,
  Triangle,
  Waves,
  Zap,
  Star,
  type LucideIcon,
} from "lucide-react";
import { NODE_COLORS } from "@/types/canvas";
import { LANDING_CONTAINER } from "./landing-links";
import { Marquee } from "./marquee";
import { MarqueeGroup } from "./marquee-group";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

// All companies below are fictional. Text wordmarks only, no real logos.
const LOGOS: { name: string; icon: LucideIcon }[] = [
  { name: "Lumora Labs", icon: Hexagon },
  { name: "Kestrel Works", icon: Triangle },
  { name: "Alderbyte", icon: Layers },
  { name: "Orbitly", icon: Orbit },
  { name: "Tidepool Cloud", icon: Waves },
  { name: "Pinecrest", icon: Box },
  { name: "Voltwing", icon: Zap },
  { name: "Nimbus Row", icon: Cloud },
];

type Review = {
  name: string;
  role: string;
  company: string;
  quote: string;
};

// PLACEHOLDER CONTENT: these reviews, people and companies are fictional.
// Replace with real, permissioned testimonials before launch.
const REVIEWS: Review[] = [
  {
    name: "Maya Okonkwo",
    role: "Staff Engineer",
    company: "Lumora Labs",
    quote:
      "We went from a blank canvas to a reviewed architecture in one meeting. The AI draft gave us something concrete to argue about.",
  },
  {
    name: "Daniel Reyes",
    role: "CTO",
    company: "Kestrel Works",
    quote:
      "Everyone edits the same diagram live, so design reviews stopped being a screenshot relay. The exported spec goes straight into our docs.",
  },
  {
    name: "Priya Raman",
    role: "Engineering Manager",
    company: "Alderbyte",
    quote:
      "Starter templates saved us hours when onboarding new squads. People actually keep the diagrams up to date now.",
  },
  {
    name: "Tomas Lindqvist",
    role: "Founding Engineer",
    company: "Orbitly",
    quote:
      "As a two-person team we do not have an architect. Describing the system in plain English and refining it together is exactly what we needed.",
  },
  {
    name: "Aisha Bello",
    role: "Platform Lead",
    company: "Tidepool Cloud",
    quote:
      "The Markdown spec is clean enough to paste into a design doc with almost no edits. That alone justified trying it.",
  },
  {
    name: "Jonas Weber",
    role: "Solutions Architect",
    company: "Pinecrest",
    quote:
      "Seeing teammate cursors on the canvas makes remote design sessions feel like standing at a whiteboard together.",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ReviewsSection() {
  return (
    <section
      id="reviews"
      aria-labelledby="reviews-heading"
      className="relative overflow-hidden bg-base py-20 md:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[min(60rem,100%)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-dim opacity-60 blur-3xl"
      />

      <div className={`${LANDING_CONTAINER} relative`}>
        <Reveal variant="fade">
          <SectionHeading
            id="reviews-heading"
            label="Social proof"
            title="Loved by teams who ship"
            description="Teams use Grand AI to go from rough idea to a reviewed architecture, together."
          />
        </Reveal>
      </div>

      <div className="relative mt-14">
        <MarqueeGroup>
          <Marquee label="Trusted by teams at Lumora Labs, Kestrel Works, Alderbyte, Orbitly, Tidepool Cloud, Pinecrest, Voltwing and Nimbus Row" duration={40}>
            {LOGOS.map(({ name, icon: Icon }) => (
              <li
                key={name}
                className="flex shrink-0 items-center gap-2 px-6 py-2 text-copy-muted transition-colors hover:text-copy-secondary"
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="text-lg font-semibold tracking-tight">{name}</span>
              </li>
            ))}
          </Marquee>

          <Marquee
            label="Customer reviews"
            duration={60}
            reverse
            className="mt-8"
          >
            {REVIEWS.map((review, i) => {
              const color = NODE_COLORS[(i + 1) % NODE_COLORS.length];
              return (
                <li
                  key={review.name}
                  className="w-80 shrink-0 md:w-96"
                >
                  <figure className="flex h-full flex-col rounded-2xl border border-surface-border bg-surface p-6">
                    <div className="flex gap-0.5 text-state-warning" role="img" aria-label="5 out of 5 stars">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} className="h-4 w-4 fill-current" aria-hidden="true" />
                      ))}
                    </div>
                    <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-copy-secondary">
                      “{review.quote}”
                    </blockquote>
                    <figcaption className="mt-6 flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                        style={{ backgroundColor: color.fill, color: color.text }}
                      >
                        {initials(review.name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-copy-primary">
                          {review.name}
                        </span>
                        <span className="block truncate text-xs text-copy-muted">
                          {review.role}, {review.company}
                        </span>
                      </span>
                    </figcaption>
                  </figure>
                </li>
              );
            })}
          </Marquee>
        </MarqueeGroup>
      </div>
    </section>
  );
}
