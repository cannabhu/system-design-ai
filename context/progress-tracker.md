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

- 13-node-shape: `components/editor/node-shape.tsx` renders each shape: rectangle/pill/circle with CSS (`rounded-xl`/`rounded-full` + border), diamond/hexagon/cylinder as inline SVG (100x100 viewBox, `preserveAspectRatio="none"`, `non-scaling-stroke` so borders stay constant while scaling with node size). Borders use `surface-border` at rest and `brand` when selected. `CanvasNodeRenderer` passes `data.shape`, palette, and `selected` into it (still driven by the Liveblocks flow state). Shape panel renders offscreen ghost copies of each shape at its default size and uses `dataTransfer.setDragImage` (anchored top-left to match where the node drops), so the ghost follows the cursor and disappears on drop or cancel. Drop logic, panel layout, resize, and label editing untouched.

- 14-node-editing: `CanvasNodeRenderer` (`components/editor/canvas-node.tsx`) adds `NodeResizer` (visible only when selected and not editing, min 60x40, subtle brand-colored handles/lines) and inline label editing. Double-clicking the centered hit area opens a textarea (`nodrag nopan nowheel`) overlaid at the label position; the static label is hidden (not unmounted) while editing so nothing shifts. Empty labels show a faint `Label` placeholder in the same spot. Typing calls `updateNodeData`, and resizing emits dimension changes, both through `onNodesChange` into the Liveblocks flow state. Blur or `Escape` closes editing. Shape rendering, shape panel, and drop logic untouched.

- Edges: nodes have four source handles (top/right/bottom/left, small white dots with a dark border, hidden until node hover; loose connection mode lets any handle connect to any other). `CanvasFlow.handleConnect` adds a `canvasEdge` (`#f8fafc` 1.5px stroke, round caps, arrow marker) via `onEdgesChange([{type:'add'}])`, so edges sync to collaborators through Liveblocks. Deleting a selected edge uses the existing `onDelete`.

- 16-edge-behavior: `components/editor/canvas-edge.tsx` (`CanvasEdgeRenderer`, registered as `canvasEdge`) draws right-angle edges with `getSmoothStepPath`, dimmed at rest (0.55 opacity) and full on hover/selection, with a 20px invisible hit area (`BaseEdge` `interactionWidth`) so the visible line stays thin. Double-click edits the label inline: label is positioned via `EdgeLabelRenderer` at the path's `labelX/labelY`, input grows with text (hidden mirror span), saves on blur/Enter/Escape. Saved labels render as pill badges; an active edge with no label shows a faint hint. Label wrapper is `nodrag nopan nowheel` and stops pointer events. Labels write via `updateEdgeData` into `data.label`, so they sync through the Liveblocks flow state. `CanvasEdge` data type is now `CanvasEdgeData { label?: string }`. Nodes, shape panel untouched.

- 15-nodes-color-toolbar: floating color toolbar (`NodeToolbar`) above selected nodes in `components/editor/canvas-node.tsx`, one swatch per `NODE_COLORS` pair (active swatch ringed, hover glow from the pair's text color). Swatch click calls `updateNodeData(id, { color: fill })`, so both node fill and paired text color update through the Liveblocks flow state with no server calls. Toolbar is `nodrag nopan` and stops pointer events so it never drags nodes or pans. Palette reused from `types/canvas.ts`. `npm run build` passes; verified working in a live room.

- 17-canvas-ergonomics: `components/editor/canvas-controls.tsx` is a floating pill at the bottom-left of the canvas (above the shape panel in z-order) with zoom out / fit view / zoom in (React Flow instance, 200ms animation), a thin divider, then undo / redo wired to Liveblocks `useUndo`/`useRedo`, disabled and dimmed via `useCanUndo`/`useCanRedo`. `hooks/useKeyboardShortcuts.ts` listens on `window` (skips inputs, textareas, selects, contenteditable): `+`/`=` zoom in, `-` zoom out, Cmd/Ctrl+Z undo, Cmd/Ctrl+Shift+Z and Cmd/Ctrl+Y redo. Minimap removed. Shape panel, node/edge rendering, and collaborative state untouched.

- 18-starter-template: `components/editor/starter-templates.ts` defines `CanvasTemplate` and `CANVAS_TEMPLATES` (Microservices, CI/CD Pipeline, Event-Driven System) using shared canvas types, `NODE_COLORS`, and default shape sizes via small `node`/`link` helpers. `starter-templates-modal.tsx` is an `AppDialog` with a scrollable template grid; each card has an SVG preview (bounds from node positions, fitted to 240x140, lines between node centers, shapes/colors from node data), name, description, and an Import button that calls `onImport` then closes. A navbar Templates button toggles state held in `EditorShell`, shared via `StarterTemplatesContext` (`starter-templates-context.tsx`) because the navbar sits outside the Liveblocks room. `CanvasFlow` renders the modal; import removes all existing edges and nodes, then adds the template's through `onEdgesChange`/`onNodesChange` (so it syncs via Liveblocks), then calls `fitView`. No template saving, custom templates, or persistence.

## In Progress

- None.

## Next Up

- AI chat in `AiSidebar`.

## Open Questions

- Add unresolved product or implementation questions here.

## Architecture Decisions

- Cache Components is on: Clerk components and `auth()` must sit inside `<Suspense>`.
- Auth is resource-based, not middleware-based: `proxy.ts` only runs `clerkMiddleware()`; its `matcher` config decides which requests invoke Clerk middleware, but it does not enforce path-based authorization or protect any route. Every new protected page, API route, or Server Function must call `auth.protect()` (or `auth()`) itself; the editor layout check doesn't cover API routes or private data fetched elsewhere.
- Added standard Clerk URL env vars (`NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `..._SIGN_UP_URL`, `..._FALLBACK_REDIRECT_URL`) to `.env.local`; they were absent.

## Session Notes

- Add context needed to resume work in the next session.
