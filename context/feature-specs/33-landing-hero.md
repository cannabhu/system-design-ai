Add the hero section to the landing page from spec 32.

### Implementation

1. Content

- create `components/landing/hero-section.tsx`, rendered first on `/`
- small eyebrow pill above the headline, e.g. "AI-powered system design"
- headline (H1, one per page): a short, outcome-led line such as "Design systems together. Ship the spec in minutes."
- subheadline (1–2 lines): real-time collaborative canvas, AI generates the architecture, export a ready-to-use spec
- primary CTA `Start designing` → `/sign-up` (or `/editor` when signed in); secondary CTA `See how it works` → `#about`
- small trust line under the CTAs, e.g. "Free to start · No credit card" (only claims that are true for the app)

2. Product visual

- below the copy, a framed product preview that mimics the editor: a mock canvas with 5–6 nodes in the app's node colors (rectangle, pill, cylinder, diamond) joined by smooth-step edges with arrow markers, plus a small AI chat bubble and collaborator avatar/cursor chips
- build it with plain React + inline SVG/CSS, not a screenshot image, so it stays crisp and themed
- subtle entrance animation: nodes fade/scale in with a short stagger, edges draw in via `stroke-dashoffset`, collaborator cursor drifts slowly; all CSS keyframes in `globals.css`, no new animation library
- decorative only: mark the visual `aria-hidden` and give the section a text alternative through the headline and subheadline

3. Background

- near-black base with a faint grid/dot pattern and one soft radial glow in `--accent-primary-dim` behind the preview; a secondary faint glow in the AI accent
- thin hairline grid lines or corner markers are allowed if they use `--border-default`
- bottom of the section fades into the next section with a gradient to `--bg-base`

4. Responsive

- desktop: centered copy, wide preview below; mobile: stacked, headline scales with `clamp()` (about 2.25rem → 4.5rem), CTAs full width on small screens
- preview scales down proportionally on mobile and may crop its sides instead of overflowing

### UI Details

- follow `ui-context.md` strictly: dark theme tokens only, no hardcoded hex outside the shared `NODE_COLORS` palette from `types/canvas.ts` (import it for the mock nodes)
- headline in `text-copy-primary` with at most one accented phrase in `text-brand` (optionally a subtle brand-to-AI gradient text)
- preview container `rounded-3xl`, `border-surface-border`, `bg-surface`; inner mock cards `rounded-2xl`
- primary button uses brand background with `bg-base` text; secondary is outline/ghost
- animations respect `prefers-reduced-motion` (render the final static state)
- keep the largest visual from blocking LCP: no blocking images, text renders immediately

### Scope Limits

- no real canvas, React Flow, or Liveblocks in the hero preview
- no video, no third-party animation or 3D libraries
- no stats or numbers that are not real; omit rather than invent
- do not change the navbar or footer from spec 32

### Notes

- the hero preview is purely presentational: static data defined in the component file
- keep CTA targets consistent with the navbar so auth state behaves the same

### Check When Done

- hero shows eyebrow, H1, subheadline, two CTAs, and the animated editor preview
- CTAs route correctly for signed-out and signed-in users
- layout holds from 320px to 1920px with no horizontal scroll
- with reduced motion enabled, no animation runs
- contrast of all text meets WCAG AA on the dark background
- TypeScript, eslint, and `npm run build` pass
