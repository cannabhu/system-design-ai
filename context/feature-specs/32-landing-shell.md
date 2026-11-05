Add the public landing page route with its shared navbar and footer. Sections are added in specs 33–36.

### Implementation

1. Route

- replace the redirect in `app/page.tsx` with the landing page at `/`
- the page is a server component that composes section components in order: hero, about, features, social proof, FAQ (empty placeholders until specs 33–36 land)
- signed-in state must not redirect away from `/`: instead the navbar CTA switches from "Sign in / Get started" to "Open editor" (`/editor`)
- read auth with `auth()` inside a `<Suspense>` boundary (Cache Components rule for Clerk); the rest of the page must stay static and render without waiting on auth
- add `export const metadata` for the landing page (title, description, Open Graph) in the existing "Grand AI" voice

2. Navbar

- create `components/landing/landing-navbar.tsx`
- left: logo mark + "Grand AI" wordmark linking to `/`
- center (desktop): anchor links `About`, `Features`, `Reviews`, `FAQ` that smooth-scroll to section ids (`#about`, `#features`, `#reviews`, `#faq`)
- right: `Sign in` (ghost) and `Get started` (primary, brand) linking to `/sign-in` and `/sign-up`; when signed in, a single `Open editor` button
- sticky at the top with dark semi-transparent background, backdrop blur, and a bottom border that appears after the user scrolls (small client component or CSS `animation-timeline: scroll()` with a safe fallback)
- mobile (< `md`): hamburger button opens a shadcn `Sheet`/dialog panel with the same links and CTAs stacked; close on link click and on `Esc`

3. Footer

- create `components/landing/landing-footer.tsx`
- top row: logo + one-line product tagline on the left; three link columns on the right: `Product` (About, Features, Reviews, FAQ), `Account` (Sign in, Get started), `Resources` (placeholder links only if real destinations exist, otherwise omit the column)
- bottom row: copyright with the current year and "Grand AI", separated by a top border
- no newsletter form, no social icons unless real URLs exist in the project

4. Layout

- shared container: `mx-auto w-full max-w-6xl px-4 sm:px-6`
- add `scroll-smooth` and `scroll-padding-top` (navbar height) so anchor jumps are not hidden under the sticky bar
- respect `prefers-reduced-motion`: disable smooth scroll and any non-essential animation

### UI Details

- follow `ui-context.md` strictly: dark only, tokens from `globals.css` (`bg-base`, `bg-surface`, `text-copy-*`, `border-surface-border`, `text-brand`), no hardcoded hex or raw `zinc-*` classes
- Geist Sans for UI text; Lucide stroke icons only (`h-4 w-4` inline, `h-5 w-5` in buttons)
- use the existing shadcn `Button`; add `sheet` via the `shadcn` CLI only if it is not already present
- links and buttons need visible focus rings (`ring` token) and a minimum 44px tap target on mobile
- navbar reuses the existing logo treatment from the auth shell if there is one

### Scope Limits

- no section content yet beyond empty anchored `<section id="…">` placeholders
- do not change auth, middleware, or the editor routes
- no light mode, no theme toggle
- no new global state

### Notes

- `/sign-in` and `/sign-up` already exist under `app/(auth)`
- `proxy.ts` needs no change: `/` stays public and access control stays resource-based
- keep section components in `components/landing/` so each later spec only touches its own file plus `app/page.tsx`

### Check When Done

- `/` renders the landing shell for signed-out and signed-in users with no redirect
- navbar CTA reflects auth state; anchors scroll below the sticky bar correctly
- mobile menu opens, closes on link click and `Esc`, and traps focus
- keyboard navigation reaches every link with a visible focus ring
- no horizontal scroll at 320px width
- TypeScript, eslint, and `npm run build` pass
