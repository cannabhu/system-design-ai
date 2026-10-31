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

- 05-prisma: `prisma/models/project.prisma` with `Project` (ownerId, name, description?, `ProjectStatus` DRAFT/ARCHIVED, canvasJsonPath?, timestamps, indexes on ownerId/createdAt) and `ProjectCollaborator` (cascade delete, unique projectId+email, indexes on email and projectId+createdAt). `lib/prisma.ts` is a cached singleton (cached on `globalThis` outside production): `prisma+postgres://` URLs use Accelerate (`@prisma/extension-accelerate`, newly installed), otherwise `@prisma/adapter-pg`. `prisma.config.ts` now loads `.env.local` then `.env` (DATABASE_URL lives in `.env.local`). Migration `init` applied, client generated to `app/generated/prisma`. Typecheck and `npm run build` pass.

- 06-project-apis: `app/api/projects/route.ts` (GET list owned projects, POST create; blank/missing name defaults to `Untitled Project`, ID is the schema's cuid) and `app/api/projects/[projectId]/route.ts` (PATCH rename, DELETE returns 204). Auth via Clerk `auth()`: no user returns 401; project missing returns 404; non-owner returns 403 (checked before any mutation); empty rename name returns 400. Shared helpers in `lib/project-request.ts`. `lib/prisma.ts` now types the client as `PrismaClient` so the Accelerate/adapter union is callable. Backend only, UI not wired. `npm run build` passes.

## In Progress

- None.

## Next Up

- Wire project dialogs/sidebar to the project API (replace `MOCK_PROJECTS`), or canvas.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Cache Components is on: Clerk components and `auth()` must sit inside `<Suspense>`.
- Auth is resource-based, not middleware-based: `proxy.ts` does no path matching or protection. Every new protected page, API route, or Server Function must call `auth.protect()` (or `auth()`) itself; the editor layout check doesn't cover API routes or private data fetched elsewhere.
- Added standard Clerk URL env vars (`NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `..._SIGN_UP_URL`, `..._FALLBACK_REDIRECT_URL`) to `.env.local`; they were absent.

## Session Notes

- Add context needed to resume work in the next session.
