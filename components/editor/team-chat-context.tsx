"use client";

import { createContext, useContext } from "react";

import type { TeamChatMessage } from "@/types/tasks";

export interface TeamChatMessageItem extends TeamChatMessage {
  id: string;
}

export interface TeamChatState {
  /** Validated `team-chat` messages, oldest first. */
  messages: TeamChatMessageItem[];
  /** ID of the current user, to tell their messages apart. */
  currentUserId: string | null;
  /** Posts a message to the `team-chat` feed. Rejects if sending fails. */
  send: (content: string) => Promise<void>;
}

export const DISCONNECTED_TEAM_CHAT: TeamChatState = {
  messages: [],
  currentUserId: null,
  send: async () => {
    throw new Error("Chat is not connected");
  },
};

/**
 * Lets the Chat tab (outside the Liveblocks room) read and post to the
 * `team-chat` feed through `TeamChatBridge`, which lives inside the room.
 */
export const TeamChatContext = createContext<{
  state: TeamChatState;
  setState: (state: TeamChatState) => void;
}>({
  state: DISCONNECTED_TEAM_CHAT,
  setState: () => {},
});

export function useTeamChat() {
  return useContext(TeamChatContext).state;
}
