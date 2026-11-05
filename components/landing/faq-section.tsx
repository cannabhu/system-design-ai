import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LANDING_CONTAINER } from "./landing-links";
import { Reveal } from "./reveal";

export const FAQS = [
  {
    question: "What is Grand AI and who is it for?",
    answer:
      "Grand AI is a system design workspace where you sketch architecture on a shared canvas and let an AI design agent draft it for you. It is built for engineering teams, startup founders, and solo developers who want to go from an idea to a reviewed design quickly.",
  },
  {
    question: "How does the AI generate a design?",
    answer:
      "Describe what you want to build in the AI sidebar and Grand AI plans the architecture, then adds and connects nodes directly on your canvas. You can watch it work, and edit, move, or delete anything it creates just like your own shapes.",
  },
  {
    question: "Can my team collaborate in real time?",
    answer:
      "Yes. Invite teammates by email and everyone edits the same canvas at once, with live cursors and avatars showing who is there. The AI sidebar also has a team chat so you can discuss the design without leaving the page.",
  },
  {
    question: "Can I export what I design as a spec?",
    answer:
      "Yes. Grand AI can generate a Markdown spec from your canvas and conversation. Specs are saved with the project, so you can preview them and download the file any time.",
  },
] as const;

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0";

export function FaqSection({ signedIn = false }: { signedIn?: boolean }) {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="bg-base py-20 md:py-28"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div className={LANDING_CONTAINER}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <Reveal variant="slide-left">
            <p className="text-xs font-medium uppercase tracking-widest text-brand">FAQ</p>
            <h2
              id="faq-heading"
              className="mt-3 text-balance text-3xl font-semibold tracking-tight text-copy-primary sm:text-4xl"
            >
              Have any questions?
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-copy-secondary">
              Quick answers about how Grand AI works. Anything else, jump in and try it.
            </p>
          </Reveal>

          <Reveal variant="slide-right" delay={100}>
            <Accordion defaultValue={[FAQS[0].question]} className="gap-3">
              {FAQS.map((f) => (
                <AccordionItem
                  key={f.question}
                  value={f.question}
                  className="rounded-2xl border border-surface-border bg-surface px-5 transition-colors data-open:border-surface-border-subtle data-open:bg-elevated"
                >
                  <AccordionTrigger
                    className={cn(
                      "min-h-11 py-3.5 text-base text-copy-primary",
                      focusRing,
                    )}
                  >
                    {f.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 pr-8 text-sm leading-relaxed text-copy-muted">
                    {f.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>

        <Reveal variant="zoom" className="mt-16 md:mt-20">
          <div className="relative overflow-hidden rounded-3xl border border-surface-border bg-surface px-6 py-12 text-center sm:px-12 sm:py-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 max-w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-dim blur-3xl"
            />
            <div className="relative">
              <h3 className="text-balance text-2xl font-semibold tracking-tight text-copy-primary sm:text-3xl">
                Still have questions?
              </h3>
              <p className="mx-auto mt-3 max-w-md text-balance text-base text-copy-secondary">
                Jump in and see it for yourself.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href={signedIn ? "/editor" : "/sign-in"}
                  className={cn(
                    buttonVariants(),
                    "h-12 w-full px-6 text-base sm:w-auto",
                    focusRing,
                  )}
                >
                  Visit the app
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
                {!signedIn && (
                  <Link
                    href="/sign-up"
                    className={cn(
                      "inline-flex min-h-11 items-center rounded-md px-2 text-sm font-medium text-copy-secondary underline-offset-4 transition-colors hover:text-copy-primary hover:underline",
                      focusRing,
                    )}
                  >
                    Create a free account
                  </Link>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
