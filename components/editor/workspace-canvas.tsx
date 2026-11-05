"use client";

import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense";
import * as Sentry from "@sentry/nextjs";
import { ErrorBoundary } from "react-error-boundary";

import { CanvasSnapshotBridge } from "@/components/editor/canvas-snapshot-bridge";
import { AiChatBridge } from "@/components/editor/ai-chat-bridge";
import { TeamChatBridge } from "@/components/editor/team-chat-bridge";
import { AiStatusBridge } from "@/components/editor/ai-status-bridge";
import { CanvasError, CanvasLoading } from "@/components/editor/canvas-loading";
import { CanvasFlow } from "@/components/editor/canvas-flow";

export function WorkspaceCanvas({ roomId }: { roomId: string }) {
  return (
    <main className="h-full overflow-clip bg-base">
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        <RoomProvider
          id={roomId}
          initialPresence={{ cursor: null, thinking: false }}
        >
          <ErrorBoundary
            onError={(error) => Sentry.captureException(error)}
            fallback={<CanvasError />}
          >
            <ClientSideSuspense fallback={<CanvasLoading />}>
              <AiStatusBridge />
              <AiChatBridge />
              <TeamChatBridge />
              <CanvasSnapshotBridge />
              <CanvasFlow roomId={roomId} />
            </ClientSideSuspense>
          </ErrorBoundary>
        </RoomProvider>
      </LiveblocksProvider>
    </main>
  );
}
