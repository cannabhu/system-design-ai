"use client";

import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense";
import { ErrorBoundary } from "react-error-boundary";

import { AiChatBridge } from "@/components/editor/ai-chat-bridge";
import { TeamChatBridge } from "@/components/editor/team-chat-bridge";
import { AiStatusBridge } from "@/components/editor/ai-status-bridge";
import { CanvasFlow } from "@/components/editor/canvas-flow";

function CanvasMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center bg-base px-6 text-center text-sm text-copy-muted">
      {children}
    </div>
  );
}

export function WorkspaceCanvas({ roomId }: { roomId: string }) {
  return (
    <main className="h-full bg-base">
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        <RoomProvider
          id={roomId}
          initialPresence={{ cursor: null, thinking: false }}
        >
          <ErrorBoundary
            fallback={
              <CanvasMessage>
                Could not connect to the canvas. Refresh to try again.
              </CanvasMessage>
            }
          >
            <ClientSideSuspense
              fallback={<CanvasMessage>Loading canvas…</CanvasMessage>}
            >
              <AiStatusBridge />
              <AiChatBridge />
              <TeamChatBridge />
              <CanvasFlow roomId={roomId} />
            </ClientSideSuspense>
          </ErrorBoundary>
        </RoomProvider>
      </LiveblocksProvider>
    </main>
  );
}
