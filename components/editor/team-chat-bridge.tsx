"use client";

import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import {
  useCreateFeed,
  useCreateFeedMessage,
  useFeedMessages,
  useSelf,
} from "@liveblocks/react";

import {
  DISCONNECTED_TEAM_CHAT,
  TeamChatContext,
  type TeamChatMessageItem,
} from "@/components/editor/team-chat-context";
import { TEAM_CHAT_FEED_ID, teamChatMessageSchema } from "@/types/tasks";

/**
 * Renders nothing. Inside the room, it subscribes to the `team-chat` feed,
 * validates its messages, and publishes them (plus a send function) to the
 * sidebar through context.
 */
export function TeamChatBridge() {
  const { setState } = useContext(TeamChatContext);
  const self = useSelf((me) => ({ id: me.id, name: me.info?.name }));
  const selfId = self?.id ?? null;
  const selfName = self?.name;
  const { messages: feedMessages } = useFeedMessages(TEAM_CHAT_FEED_ID);
  const createFeed = useCreateFeed();
  const createFeedMessage = useCreateFeedMessage();
  const feedReady = useRef(false);

  const messages = useMemo(() => {
    const valid: TeamChatMessageItem[] = [];
    for (const message of feedMessages ?? []) {
      const parsed = teamChatMessageSchema.safeParse(message.data);
      if (parsed.success) valid.push({ id: message.id, ...parsed.data });
    }
    return valid.sort((a, b) => a.timestamp - b.timestamp);
  }, [feedMessages]);

  const send = useCallback(
    async (content: string) => {
      if (!selfId) throw new Error("Not connected to the room");
      if (!feedReady.current) {
        try {
          await createFeed(TEAM_CHAT_FEED_ID);
        } catch {
          // Feed already exists.
        }
        feedReady.current = true;
      }
      await createFeedMessage(TEAM_CHAT_FEED_ID, {
        sender: { id: selfId, name: selfName || "Unknown" },
        content,
        timestamp: Date.now(),
      });
    },
    [selfId, selfName, createFeed, createFeedMessage],
  );

  useEffect(() => {
    setState({ messages, currentUserId: selfId, send });
    return () => setState(DISCONNECTED_TEAM_CHAT);
  }, [messages, selfId, send, setState]);

  return null;
}
