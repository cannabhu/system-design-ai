Add the social proof section to the landing page: a company logo marquee and an auto-scrolling reviews slider.

### Implementation

1. Section shell (`id="reviews"`)

- create `components/landing/reviews-section.tsx`
- section label, H2 (e.g. "Loved by teams who ship"), one-line subtext
- two stacked rows: logo marquee on top, review cards slider below

2. Logo marquee

- 6–8 company entries rendered as text wordmarks with a simple Lucide icon or inline SVG mark (no real trademarked logos, no external images). Use clearly fictional company names so nothing implies a real endorsement
- infinite horizontal marquee, pure CSS: the list is rendered twice inside a track animated with `translateX(-50%)` on a linear infinite loop (~40s)
- edges fade out with a CSS `mask-image` linear gradient on the container
- pause on hover and on keyboard focus within; logos in `text-copy-muted`, lifting to `text-copy-secondary` on hover
- the duplicated list is `aria-hidden`; the first copy is a labeled list ("Trusted by teams at …")

3. Reviews slider

- 6 review cards in a second marquee moving in the opposite direction at a slower speed (~60s), same duplicated-track technique, same edge-fade mask
- each card: star rating (5 filled Lucide `Star` icons using `text-state-warning`), quote (2–4 lines), avatar (initials on a tinted circle, no photos), name, role, company
- reviews are fictional sample content kept in one typed array in the component file; add a code comment marking them as placeholders to replace with real testimonials before launch
- pause the animation on hover/focus; cards fixed width (`w-80 md:w-96`) with `gap-4`
- optional Pause/Play toggle button (visible, keyboard accessible) for users who need to stop motion

4. Accessibility and motion

- under `prefers-reduced-motion`, stop the animations and turn each row into a horizontally scrollable, scroll-snapped strip
- animation runs only while the section is in view (toggle `animation-play-state` via `IntersectionObserver` in a tiny client component, or CSS only if sufficient)
- do not use `will-change` broadly; apply `transform` animation only on the tracks
- the marquee must not cause layout shift or horizontal page scroll (`overflow-hidden` on the section container)

### UI Details

- follow `ui-context.md` strictly: `bg-surface` cards on `bg-base`, `rounded-2xl`, `border-surface-border`, tokens only
- avatar tints may use `NODE_COLORS` pairs from `types/canvas.ts` for variety without new hex values
- quote text `text-copy-secondary`, name `text-copy-primary`, role `text-copy-muted`
- subtle gradient or glow behind the section using `--accent-primary-dim`; keep it low contrast
- keep animation smooth: transform-only, constant speed, no easing jitter at the loop seam

### Scope Limits

- no backend, database, or API for reviews
- no external images, logo CDNs, or carousel libraries
- no real company names or real people
- do not change other sections, the navbar, or the footer

### Notes

- track width must be consistent so the `-50%` loop is seamless: render the same items in both halves and use `flex-shrink-0`
- put marquee keyframes in `globals.css` alongside the existing `canvas-load` keyframes
- `Reveal` from spec 34 may wrap the section header only, not the moving tracks

### Check When Done

- logo marquee and reviews slider scroll continuously in opposite directions with no visible jump at the loop point
- hover and focus pause the motion; reduced motion shows static scrollable strips
- 6–8 logos and at least 6 reviews are present with accurate star markup
- no horizontal page scroll at 320px; no layout shift on load
- screen reader reads the review list once, not duplicated
- TypeScript, eslint, and `npm run build` pass
