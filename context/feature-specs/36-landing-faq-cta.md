Add the FAQ section and closing call-to-action to the landing page, completing the page.

### Implementation

1. FAQ section (`id="faq"`)

- create `components/landing/faq-section.tsx`
- heading "Have any questions?" with a short subtext
- exactly four questions, answered in 2–3 sentences each, based on real app behavior:
  1. What is Grand AI and who is it for?
  2. How does the AI generate a design?
  3. Can my team collaborate in real time?
  4. Can I export what I design as a spec?
- accordion built on the existing shadcn/ui primitives: add `accordion` through the `shadcn` CLI if not present (single-open, collapsible, first item open by default)
- smooth height animation using the accordion's built-in keyframes; chevron rotates on open
- keyboard support (Enter/Space/arrows), `aria-expanded` and `aria-controls` come from the primitive; do not replace it with custom div toggles
- layout: heading column on the left and accordion on the right on desktop; stacked on mobile

2. Catch-up CTA

- below the FAQ, a closing card: short line such as "Still have questions? Jump in and see it for yourself."
- primary button `Visit the app` → `/editor` when signed in, `/sign-in` when signed out (reuse the same auth-aware check from spec 32, not a second auth call per component; pass it down as a prop from `app/page.tsx`)
- secondary text link `Create a free account` → `/sign-up` shown only when signed out
- card uses `rounded-3xl` with a soft brand glow and faint grid pattern, echoing the hero

3. Page finish

- confirm all five sections plus navbar and footer are composed in `app/page.tsx` in order
- add FAQ structured data (`FAQPage` JSON-LD) built from the same questions array so SEO matches visible content
- verify anchor navigation to `#about`, `#features`, `#reviews`, `#faq` from the navbar and footer
- set `app/opengraph-image` or equivalent metadata only if trivial; otherwise skip

### UI Details

- follow `ui-context.md` strictly: dark tokens only, `bg-surface` accordion items with `border-surface-border`, `rounded-2xl`, question text `text-copy-primary`, answer `text-copy-muted`
- open item gets a subtle `border-surface-border-subtle` and `bg-elevated`
- focus rings use the `ring` token; touch targets at least 44px high
- Lucide `ChevronDown` and `ArrowRight` icons only, stroke style
- vertical rhythm matches specs 34 and 35 (`py-20 md:py-28`)

### Scope Limits

- exactly four FAQ items; no search, categories, or tabs
- no contact form, chat widget, or newsletter signup
- do not change auth, middleware, or the editor
- no new global state

### Notes

- the CTA copy and routes must match navbar behavior from spec 32
- keep answers factual; remove any claim the app does not support
- update `context/progress-tracker.md` once specs 32–36 are implemented

### Check When Done

- four questions open and close smoothly, one at a time, via mouse and keyboard
- CTA routes correctly for signed-in and signed-out users
- JSON-LD renders valid FAQPage data
- full page scrolls cleanly top to bottom with working anchors and no horizontal overflow at 320px
- Lighthouse accessibility check shows no critical issues on the landing page
- TypeScript, eslint, and `npm run build` pass
