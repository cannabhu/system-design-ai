"use client";

import { createContext, useContext } from "react";

export interface AiStatusState {
  /** True while any participant is generating (presence `thinking`). */
  isGenerating: boolean;
  /** Text of the most recent valid `ai-status-feed` message, if any. */
  statusText: string | null;
  /** Run that posted `statusText`, when known. */
  statusRunId: string | null;
}

/**
 * Lets the AI sidebar (outside the Liveblocks room) read shared AI activity
 * published by `AiStatusBridge`, which lives inside the room.
 */
export const AiStatusContext = createContext<{
  state: AiStatusState;
  setState: (state: AiStatusState) => void;
}>({
  state: { isGenerating: false, statusText: null, statusRunId: null },
  setState: () => {},
});

export function useAiStatus() {
  return useContext(AiStatusContext).state;
}
