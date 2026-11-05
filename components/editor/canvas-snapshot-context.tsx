"use client";

import { createContext, useContext } from "react";

export interface CanvasSnapshot {
  nodes: { id: string; data: { label?: string; shape?: string } }[];
  edges: {
    id: string;
    source: string;
    target: string;
    data?: { label?: string };
  }[];
}

interface CanvasSnapshotState {
  /** Registered by `CanvasSnapshotBridge` (inside the room). */
  register: (getter: (() => CanvasSnapshot) | null) => void;
  /** Current canvas contents, or null when the room is not connected. */
  get: () => CanvasSnapshot | null;
}

/**
 * Lets the AI sidebar (outside the Liveblocks room) read the live canvas
 * when it needs to send it to the server, without subscribing to it.
 */
export const CanvasSnapshotContext = createContext<CanvasSnapshotState>({
  register: () => {},
  get: () => null,
});

export function useCanvasSnapshot() {
  return useContext(CanvasSnapshotContext);
}
