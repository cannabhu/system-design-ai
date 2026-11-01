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

- 07-wire-editor-home: `app/editor/layout.tsx` (server) fetches owned and shared projects via new `lib/project-queries.ts` (`getOwnedProjects`, `getSharedProjects` by Clerk primary email) and passes them through `EditorShell` to `ProjectSidebar` (names link to `/editor/[id]`). `useProjectDialogs` now calls the API: create generates `slugify(name)-<6 char suffix>` (`createRoomId` in `lib/projects.ts`), `POST /api/projects` with that `id`, then navigates to `/editor/[id]` and refreshes; rename `PATCH` + refresh; delete `DELETE` + redirect to `/editor` if active workspace, else refresh. Dialogs show a room ID preview, pre-filled rename name, project name on delete, and API errors. `POST /api/projects` now accepts an optional validated `id` (409 if taken) so project ID = Liveblocks room ID. Mock projects removed. `npm run build` passes.

- 08-editor-workspace-shell: `app/editor/[roomId]/page.tsx` (server): unauthenticated redirects to `/sign-in`; missing or unauthorized projects render `components/editor/access-denied.tsx` (lock icon, message, link to `/editor`); otherwise renders `WorkspaceCanvas` (dark placeholder, centered message). Access helpers in `lib/project-access.ts` (`getCurrentIdentity`: Clerk `userId` + primary email; `getProjectIfAccessible`: owner or collaborator by email). `EditorShell` reads `roomId` via `useParams`, passes the project name to `EditorNavbar` (name, Share button, AI sidebar toggle shown only on a workspace), and renders the `AiSidebar` placeholder on the right. `ProjectSidebar` highlights the current room. No canvas, Liveblocks, AI chat, or sharing behavior. Typecheck, lint, and `npm run build` pass.

- 09-share-dialog: Navbar Share button opens `components/editor/share-dialog.tsx` (mounted in `EditorShell`). Owners can invite by email, remove collaborators, and see the list; collaborators see the list read-only; everyone can copy the project link (`Copied!` feedback for 2s). APIs: `GET/POST /api/projects/[projectId]/collaborators` (GET for any member; POST owner-only, validates/lowercases email, 400 invalid or own email, 409 duplicate) and `DELETE .../collaborators/[collaboratorId]` (owner-only). Ownership enforced server-side via `getProjectIfAccessible` role. `lib/collaborators.ts` enriches emails with Clerk Backend API (`users.getUserList`) display name + avatar, falling back to email only (also on Clerk errors). No local user table. `Collaborator` type in `lib/projects.ts`.

- 10-liveblocks-setup: `liveblocks.config.ts` types Presence (`cursor`, `isThinking`) and UserMeta (`id`, `info.name/avatar/color`). `lib/liveblocks.ts` is a cached node client (`getLiveblocks`, needs `LIVEBLOCKS_SECRET_KEY`); `lib/cursor-color.ts` hashes a user ID to a fixed palette color. `POST /api/liveblocks-auth` requires Clerk auth (401), reads `room` from the body (room ID = project ID), checks `getProjectIfAccessible` (403), `getOrCreateRoom` with no default access, and returns a session token carrying name, avatar, and color. Installed `@liveblocks/node` (the spec assumed it was present). Not yet exercised: `LIVEBLOCKS_SECRET_KEY` must be added to `.env.local`.

- 11-base-canvas: `WorkspaceCanvas` (client) now takes `roomId` and sets up `LiveblocksProvider` (`/api/liveblocks-auth`), `RoomProvider` (initial presence `cursor: null`, plus `isThinking: false` as the Presence type requires it), `ErrorBoundary` (connection-error fallback) and `ClientSideSuspense` (loading state). `components/editor/canvas-flow.tsx` uses `useLiveblocksFlow` (suspense, empty initial nodes/edges) wired into `ReactFlow` with loose connection mode, `fitView`, `MiniMap`, dot `Background`. Shared types in `types/canvas.ts` (`CanvasNodeData` label/color/shape, `canvasNode`, `canvasEdge`). Workspace page stays server-side and passes `project.id`. Installed `react-error-boundary`. No controls, custom node/edge rendering, persistence, or AI. `npm run build` passes; not yet exercised against a live room (needs `LIVEBLOCKS_SECRET_KEY`).

- 12-shape-panel: `components/editor/shape-panel.tsx` (floating bottom-center pill toolbar; draggable rectangle/diamond/circle/pill/cylinder/hexagon buttons, payload `{shape, width, height}` under `SHAPE_DRAG_MIME`). Defaults/parsing in `lib/canvas-shapes.ts` (rectangle 160x80, circle 100x100, diamond 160x120, etc.). `CanvasFlow` is wrapped in `ReactFlowProvider`; the wrapper handles `dragover`/`drop`, converts with `screenToFlowPosition`, and adds a `canvasNode` (empty label, default color `#1F1F1F`, ID `shape-timestamp-counter`) through `onNodesChange([{type:'add'}])`. `components/editor/canvas-node.tsx` renders every shape as a bordered rectangle with centered label (shape visuals later). `types/canvas.ts` gained `NODE_SHAPES` (incl. cylinder, hexagon), `NODE_COLORS`, `DEFAULT_NODE_COLOR`. `npm run build` passes; drag/drop not yet exercised in a live room.

## In Progress

- None.

## Next Up

- Canvas controls, shape-specific node visuals, custom edge rendering, and AI chat in `AiSidebar`.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Cache Components is on: Clerk components and `auth()` must sit inside `<Suspense>`.
- Auth is resource-based, not middleware-based: `proxy.ts` does no path matching or protection. Every new protected page, API route, or Server Function must call `auth.protect()` (or `auth()`) itself; the editor layout check doesn't cover API routes or private data fetched elsewhere.
- Added standard Clerk URL env vars (`NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `..._SIGN_UP_URL`, `..._FALLBACK_REDIRECT_URL`) to `.env.local`; they were absent.

## Session Notes

- Add context needed to resume work in the next session.
