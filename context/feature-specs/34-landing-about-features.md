Add the About section (what the project is and does) and the Features section (what makes it special and how it helps teams) to the landing page.

### Implementation

1. About section (`id="about"`)

- create `components/landing/about-section.tsx`
- section label ("What is Grand AI"), H2, and a short paragraph: a real-time collaborative system design workspace where AI generates architecture and specs
- "How it works" as three numbered steps in a row (stacked on mobile):
  1. Describe: tell the AI what you are building
  2. Design: AI lays out nodes and edges on a shared canvas, the team edits together
  3. Export: generate a Markdown spec and download it
- each step: step number, Lucide icon, title, one-line description, connected by a thin dashed line between steps on desktop
- optional small row of 3 capability chips (Real-time collaboration, AI generation, Spec export)

2. Features section (`id="features"`)

- create `components/landing/features-section.tsx`
- section label, H2 focused on outcomes (e.g. "Less whiteboard chaos, more shipped architecture"), one-line subtext
- bento-style grid of 6 feature cards; one or two cards span wider for visual rhythm. Cover only features the app actually has:
  - Real-time collaboration: live cursors, presence avatars, shared canvas
  - AI design agent: describe a system, watch nodes and edges appear
  - Spec generation: turn the diagram into a downloadable Markdown spec
  - Rich node shapes: rectangle, diamond, circle, pill, cylinder, hexagon with a color palette
  - Autosave and sharing: canvas autosaves, share a project with teammates
  - Starter templates: begin from a template instead of a blank canvas
- each card: icon in a `bg-accent-dim` rounded tile, title, 1–2 line benefit-led description (what problem it removes for the team), optional tiny visual (e.g. mini node cluster, avatar stack, markdown snippet) built with CSS/SVG
- add a short "Built for" strip below the grid with 3 audiences: engineering teams, startup founders, solo developers, each with one line on the pain point solved

3. Motion

- cards and steps reveal on scroll with a short fade-up and stagger using `IntersectionObserver` in one small shared client component (`components/landing/reveal.tsx`), reused by later specs
- hover on cards: border shifts to `--border-subtle`, a soft brand glow follows the cursor via CSS variables or simply fades in
- all motion off under `prefers-reduced-motion`; content must be visible without JavaScript

### UI Details

- follow `ui-context.md` strictly: tokens only, `bg-surface` cards on `bg-base`, `rounded-2xl` for cards, `border-surface-border`
- use Lucide stroke icons only, `h-5 w-5` inside `h-10 w-10` rounded tiles
- brand cyan for primary highlights, AI indigo-purple (`text-ai-text`, `bg-ai`) reserved for AI-related features so the color carries meaning
- vertical rhythm: `py-20 md:py-28`, headings centered with `max-w-2xl`, grid `gap-4 md:gap-6`
- grid: 1 column on mobile, 2 on `sm`, 3 on `lg` with spanning cards

### Scope Limits

- no pricing, plans, or claims about features that do not exist
- no images, stock illustrations, or new dependencies; build visuals with CSS and SVG
- do not change hero, navbar, or footer
- no new global state

### Notes

- confirm feature claims against `context/project-overview.md` and the completed specs before finalizing copy
- placeholder anchors `#about` and `#features` already exist from spec 32; replace their placeholders

### Check When Done

- About shows the 3-step flow; Features shows 6 accurate cards plus the "Built for" strip
- nav anchors land on the correct sections beneath the sticky navbar
- reveal animations run once per element and are disabled with reduced motion
- layout works at 320px, 768px, and 1280px with no overflow
- all icon tiles and cards have sufficient contrast and no hardcoded colors
- TypeScript, eslint, and `npm run build` pass
