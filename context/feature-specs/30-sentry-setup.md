Install and configure Sentry (`@sentry/nextjs`) for error and performance monitoring. This unit only sets up the SDK, config, and build integration. Wiring it into existing app code is spec 31.

### Implementation

1. Install

- add `@sentry/nextjs`
- do not run the Sentry wizard in a way that overwrites existing files (`next.config.ts`, `proxy.ts`, `app/layout.tsx`); apply the changes by hand

2. SDK config files (project root, Next.js App Router layout)

- `instrumentation-client.ts`: `Sentry.init` for the browser; export `onRouterTransitionStart = Sentry.captureRouterTransitionStart`
- `sentry.server.config.ts`: `Sentry.init` for the Node runtime
- `sentry.edge.config.ts`: `Sentry.init` for the edge runtime
- `instrumentation.ts`: `register()` imports the server or edge config based on `process.env.NEXT_RUNTIME`; export `onRequestError = Sentry.captureRequestError`
- `app/global-error.tsx`: client component that calls `Sentry.captureException(error)` in an effect and renders a minimal fallback with a reset action, styled with existing tokens from `globals.css`

3. Init options (shared values live in one small helper, e.g. `lib/sentry-options.ts`, so the three configs do not drift)

- `dsn` from `NEXT_PUBLIC_SENTRY_DSN` (browser) / `SENTRY_DSN` (server, edge)
- `environment` from `VERCEL_ENV` / `NODE_ENV`
- `enabled` only when a DSN exists, so local dev without a DSN is a silent no-op
- `tracesSampleRate`: `0.1` in production, `1.0` otherwise
- `sendDefaultPii: false`
- browser only: `replaysSessionSampleRate: 0`, `replaysOnErrorSampleRate: 1.0` with the replay integration; mask all text and block media by default (the canvas contains user content)

4. `next.config.ts`

- wrap the existing config with `withSentryConfig`, keeping `cacheComponents`, `partialPrefetching`, `experimental.agentFeedback`, and the `turbopack` rules unchanged
- `org` and `project` from env, `authToken` from `SENTRY_AUTH_TOKEN`
- `tunnelRoute: "/monitoring"` to avoid ad blockers
- `silent: !process.env.CI`
- source map upload only when `SENTRY_AUTH_TOKEN` is set; the build must still pass without it

5. Environment

- add to `.env.local` placeholders (do not commit real values): `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`
- list the same variables in the progress tracker note so Vercel can be configured

### UI Details

- `global-error.tsx` is the only visible change; keep it plain, dark, and consistent with `ui-context.md`

### Scope Limits

- do not add user identification, custom tags, or `captureException` calls in app code (spec 31)
- do not touch Trigger.dev tasks (spec 31)
- do not change `proxy.ts` (spec 31)
- do not add Sentry logging, profiling, or feature flags
- no changes to Prisma, Liveblocks, or Clerk code

### Notes

- Next 16 with Cache Components: do not read `window`, dates, or random values at module scope in the new files; `Sentry.init` is fine
- `npm run build` must pass with and without `SENTRY_AUTH_TOKEN`
- the `/monitoring` tunnel path is handled in spec 31 because Clerk middleware currently matches almost every path

### Check When Done

- `@sentry/nextjs` installed and the config files exist
- app runs with no DSN and logs no Sentry errors
- with a DSN, a thrown test error (temporary, removed afterward) appears in Sentry from both client and server
- `app/global-error.tsx` reports to Sentry
- `next.config.ts` keeps all previous options
- TypeScript, eslint, and `npm run build` pass
