"use client";

import { createContext, useContext } from "react";

import type { AiChatMessage } from "@/types/tasks";

export interface AiChatMessageItem extends AiChatMessage {
  id: string;
}

export interface AiChatState {
  /** Validated `ai-chat` messages, oldest first. */
  messages: AiChatMessageItem[];
  /** ID of the current user, to tell their messages apart. */
  currentUserId: string | null;
  /**
   * Posts a message to the `ai-chat` feed (as the user by default, or as
   * Grand AI for `assistant`). Rejects if sending fails.
   */
  send: (content: string, role?: "user" | "assistant") => Promise<void>;
}

/**
 * Lets the AI sidebar (outside the Liveblocks room) read and post to the
 * `ai-chat` feed through `AiChatBridge`, which lives inside the room.
 */
export const AiChatContext = createContext<{
  state: AiChatState;
  setState: (state: AiChatState) => void;
}>({
  state: {
    messages: [],
    currentUserId: null,
    send: async () => {
      throw new Error("Chat is not connected");
    },
  },
  setState: () => {},
});

export function useAiChat() {
  return useContext(AiChatContext).state;
}
