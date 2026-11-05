Wire the Sentry setup from spec 30 into the existing app so real errors and user context reach Sentry.

### Implementation

1. Middleware

- update the `matcher` in `proxy.ts` so the Sentry tunnel route (`/monitoring`) is excluded from Clerk middleware
- do not change the existing protected-route logic

2. User context

- add a small client component (e.g. `components/sentry-user.tsx`) that uses Clerk's `useUser` and calls `Sentry.setUser({ id })` on sign-in and `Sentry.setUser(null)` on sign-out
- send the Clerk user ID only, no email or name
- mount it once in `app/layout.tsx` inside `ClerkProvider` and inside `<Suspense>` (Cache Components rule for Clerk)

3. Route error boundaries

- add `app/editor/error.tsx` (and the home route if it has none) that calls `Sentry.captureException` and shows the existing fallback pattern with a retry
- the editor already uses `react-error-boundary`: add `onError` to those boundaries that forwards to `Sentry.captureException`

4. API routes

- in the catch paths of `app/api/ai/design`, `app/api/ai/spec` (and `/token` routes), `app/api/projects/**`, `app/api/liveblocks-auth`, and `app/api/cron/liveblocks-cleanup`, call `Sentry.captureException` for unexpected failures (5xx)
- do not capture expected responses: 400, 401, 403, 404
- attach `projectId` as a tag where it is known; no prompt text, chat history, canvas content, or spec content

5. Trigger.dev tasks

- add `@sentry/node` only if `@sentry/nextjs` cannot be imported in the task runtime; prefer one shared `trigger/sentry.ts` helper that inits Sentry from `SENTRY_DSN` once
- use the global `onFailure` hook in `trigger.config.ts` to capture task failures with tags `task` (task id), `runId`, and `projectId` when present in the payload
- call `Sentry.flush(2000)` before the hook returns so the event is sent before the worker exits
- the design agent and generate-spec behavior must not change
- add `SENTRY_DSN` to the Trigger.dev environment variables and note it in the progress tracker

6. Client-side noise

- ignore known harmless errors in `beforeSend`/`ignoreErrors` (e.g. `ResizeObserver loop` warnings) in the shared options helper from spec 30
- strip request bodies and cookies in `beforeSend`

### Scope Limits

- do not add custom dashboards, alerts, or performance spans beyond defaults
- do not log prompts, chat, canvas data, or spec content to Sentry
- do not change auth, Liveblocks, or Prisma behavior
- do not add new global state or UI beyond the error fallbacks
- no changes to the sidebar, canvas, or specs UI

### Notes

- Auth stays resource-based: new files must not add route protection
- keep Sentry calls thin; if a catch block already logs, add one line rather than restructuring it
- verify the Trigger.dev import path works in the deployed worker bundle, not just locally

### Check When Done

- `/monitoring` requests bypass Clerk middleware and are accepted
- a signed-in user's ID shows on events; signed-out clears it
- a forced 5xx in an API route and a forced task failure each appear in Sentry with the expected tags
- 4xx responses produce no Sentry events
- no PII or user content in captured events
- TypeScript, eslint, and `npm run build` pass
