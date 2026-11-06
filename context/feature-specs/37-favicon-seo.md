Replace the placeholder favicon with a branded icon set and add site-wide SEO: metadata defaults, social previews, `robots`, `sitemap`, and structured data.

### Implementation

1. Favicon and app icons

- the current `app/favicon.ico` is the Next.js default; replace it with the Grand AI mark: the `Sparkles` glyph from `components/landing/landing-logo.tsx` on a rounded square using the AI accent, matching the navbar logo
- use Next file conventions in `app/` (no manual `<link>` tags):
  - `app/favicon.ico` (multi-size 16/32/48)
  - `app/icon.svg` (primary, scalable, works in dark and light browser chrome)
  - `app/apple-icon.png` (180x180, solid background, no transparency)
- add `app/manifest.ts` returning a web app manifest: name "Grand AI", short_name "Grand AI", `display: "standalone"`, `background_color` and `theme_color` from the `--bg-base` value, plus 192 and 512 PNG icons in `public/` (`icon-192.png`, `icon-512.png`)
- generate the PNG/ICO assets from the SVG once (script or tool of choice, kept out of the repo); commit only the outputs

2. Site-wide metadata (`app/layout.tsx`)

- add a single source of truth for the site URL: `lib/site.ts` exporting `siteConfig` (`name`, `url`, `description`, `ogImage`) and reading the origin from a new `NEXT_PUBLIC_SITE_URL` env var (fallback `http://localhost:3000` in dev only); add it to `.env.example` if present and document it in the progress tracker
- extend the root `metadata` export:
  - `metadataBase: new URL(siteConfig.url)`
  - `title: { default: "Grand AI | AI-powered system design workspace", template: "%s | Grand AI" }`
  - `description`, `applicationName`, `keywords` (short, relevant list), `authors`, `creator`
  - `openGraph` defaults (`type: "website"`, `siteName`, `locale: "en_US"`) and `twitter` defaults (`card: "summary_large_image"`)
  - `alternates: { canonical: "/" }` at root; pages override with their own path
- add `export const viewport` with `themeColor` set to the dark base color and `colorScheme: "dark"`
- `app/page.tsx` keeps its own `title`/`description` (already set in spec 32); change it to use `siteConfig` so the values are defined once, and use `title: { absolute: ... }` so the template is not applied twice

3. Social preview images

- add `app/opengraph-image.tsx` and `app/twitter-image.tsx` (or one shared renderer) using `next/og` `ImageResponse`, 1200x630, dark `--bg-base` background, logo mark, "Grand AI" wordmark, and the tagline "AI-powered system design workspace"
- use only fonts available without a network fetch at request time (bundle the font file or fall back to system sans); no external images
- set `alt` and `size`/`contentType` exports

4. Crawling controls

- `app/robots.ts`: allow `/`, disallow `/editor`, `/api/`, `/sentry-example-page`, `/monitoring`; point `sitemap` at `${siteConfig.url}/sitemap.xml`
- `app/sitemap.ts`: list only public indexable routes: `/` (priority 1, `changeFrequency: "monthly"`), `/sign-in`, `/sign-up` (lower priority)
- per-route `robots` metadata:
  - `app/editor/layout.tsx`: `robots: { index: false, follow: false }` plus a `title` of "Editor"
  - sign-in and sign-up pages: `robots: { index: false }` is acceptable; keep them in the sitemap only if they should be discoverable, otherwise omit them (decide and note it; default is omit)
  - `app/sentry-example-page/page.tsx`: `noindex`

5. Structured data

- add JSON-LD on the landing page only, rendered as a `<script type="application/ld+json">` from a small `components/seo/json-ld.tsx` helper (escape `<` as `<` when serializing)
- schemas: `WebSite` (name, url), `Organization` (name, url, logo), and `SoftwareApplication` (name, `applicationCategory: "DeveloperApplication"`, `operatingSystem: "Web"`, short description, a free `Offer` only if the app is actually free)
- the existing `FAQPage` JSON-LD from spec 36 stays as is; do not duplicate it
- every property must reflect real app behavior; omit anything unverifiable (no ratings, no review counts, no pricing claims)

### Scope Limits

- no analytics, tracking pixels, or cookie banner
- no per-project or per-spec public pages, and no dynamic sitemap entries for user data
- no i18n/`hreflang` work
- do not change auth, middleware matcher behavior, or the editor UI
- no new dependencies unless required for icon generation (and then only as a dev-time tool, not added to `package.json`)

### Notes

- the middleware matcher in `proxy.ts` already skips `.ico`, `.png`, `.svg` and `.webmanifest`; `robots.txt`, `sitemap.xml`, `manifest.webmanifest` and the generated OG image routes may still pass through Clerk middleware, which is fine because they do not call `auth()`; verify they respond 200 while signed out
- with `cacheComponents: true`, the metadata files must not read request-time data; `siteConfig` is static so `robots`, `sitemap` and the OG images prerender
- `NEXT_PUBLIC_SITE_URL` must also be set in the Vercel project environment; without it social previews and the canonical URL point at localhost
- update `context/progress-tracker.md` when done

### Check When Done

- browser tab shows the new favicon in dark and light browser themes; iOS home-screen icon and the manifest install icon render correctly
- `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/opengraph-image`, and `/twitter-image` all return 200 while signed out
- page source of `/` shows the expected `<title>`, description, canonical, Open Graph and Twitter tags, `theme-color`, and the JSON-LD blocks with no duplicate `<title>` suffix
- `/editor/*` pages carry `noindex`; `/api/*` and `/editor` are disallowed in `robots.txt`
- JSON-LD validates in Google's Rich Results Test (Organization, WebSite, SoftwareApplication, FAQPage) with no errors
- OG image renders correctly in the opengraph.xyz or a similar preview tool once deployed
- Lighthouse SEO score is 100 on the landing page
- TypeScript, eslint, and `npm run build` pass
