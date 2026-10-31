# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Not started

## Current Goal

- Define the immediate implementation goal here.

## Completed

- 01-design-system: shadcn/ui setup, UI primitives (Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea), lucide-react, `cn()` helper.
- 02-editor: `EditorNavbar`, `ProjectSidebar` (floating overlay, My Projects/Shared tabs, empty states, New Project button), `AppDialog` pattern in `components/ui/app-dialog.tsx`. Typecheck and lint clean. Mounted via the editor layout.
- 03-auth: Clerk wired in. `ClerkProvider` (dark theme + CSS-variable appearance) in root layout, `proxy.ts` runs `clerkMiddleware()` (protection now lives in `app/editor/layout.tsx`, see 05), `/` redirects to `/editor` or `/sign-in`, sign-in/sign-up pages in `app/(auth)` with shared `AuthShell` two-panel layout, `UserButton` in `EditorNavbar`. `@clerk/ui` installed. `npm run build` and lint pass.

- Editor route: `app/editor/layout.tsx` renders `EditorShell` (client, owns `isSidebarOpen`; navbar on top, sidebar floating over the content area), `app/editor/page.tsx` is an empty-state placeholder. Fixes the post-sign-in 404. `npm run build` and lint pass.

- 04-project-dialogs: `/editor` home (`EditorHome`: heading, description, New Project button), Create/Rename/Delete dialogs (`components/editor/project-dialogs.tsx`) with live slug preview, `useProjectDialogs` hook (`hooks/use-project-dialogs.ts`: dialog, form, loading state, in-memory mock projects from `lib/projects.ts`), shared via `ProjectDialogsProvider` in `EditorShell`. Sidebar lists mock projects, rename/delete actions for owned projects only, mobile backdrop scrim closes sidebar. No API calls or persistence. Typecheck and lint clean.

- Auth Migration: Removed deprecated Clerk `createRouteMatcher` from `proxy.ts`, which now only runs `clerkMiddleware()` (matcher config unchanged). Auth check moved to resource level: `app/editor/layout.tsx` calls `await auth.protect()` inside `<Suspense>` before rendering `EditorShell`. Typecheck passes.

## In Progress

- None.

## Next Up

- Define the next feature spec (project creation / data model, or canvas).

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Cache Components is on: Clerk components and `auth()` must sit inside `<Suspense>`.
- Auth is resource-based, not middleware-based: `proxy.ts` does no path matching or protection. Every new protected page, API route, or Server Function must call `auth.protect()` (or `auth()`) itself; the editor layout check doesn't cover API routes or private data fetched elsewhere.
- Added standard Clerk URL env vars (`NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `..._SIGN_UP_URL`, `..._FALLBACK_REDIRECT_URL`) to `.env.local`; they were absent.

## Session Notes

- Add context needed to resume work in the next session.
