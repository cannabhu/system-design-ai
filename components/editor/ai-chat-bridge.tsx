"use client";

import { useCallback, useContext, useEffect, useMemo, useRef } from "react";
import {
  useCreateFeed,
  useCreateFeedMessage,
  useFeedMessages,
  useSelf,
} from "@liveblocks/react";

import {
  AiChatContext,
  type AiChatMessageItem,
} from "@/components/editor/ai-chat-context";
import { AI_CHAT_FEED_ID, aiChatMessageSchema } from "@/types/tasks";

/**
 * Renders nothing. Inside the room, it subscribes to the `ai-chat` feed,
 * validates its messages, and publishes them (plus a send function) to the
 * sidebar through context.
 */
export function AiChatBridge() {
  const { setState } = useContext(AiChatContext);
  const self = useSelf((me) => ({ id: me.id, name: me.info?.name }));
  const selfId = self?.id ?? null;
  const selfName = self?.name;
  const { messages: feedMessages } = useFeedMessages(AI_CHAT_FEED_ID);
  const createFeed = useCreateFeed();
  const createFeedMessage = useCreateFeedMessage();
  const feedReady = useRef(false);

  const messages = useMemo(() => {
    const valid: AiChatMessageItem[] = [];
    for (const message of feedMessages ?? []) {
      const parsed = aiChatMessageSchema.safeParse(message.data);
      if (parsed.success) valid.push({ id: message.id, ...parsed.data });
    }
    return valid.sort((a, b) => a.timestamp - b.timestamp);
  }, [feedMessages]);

  const send = useCallback(
    async (content: string, role: "user" | "assistant" = "user") => {
      if (!selfId) throw new Error("Not connected to the room");
      if (!feedReady.current) {
        try {
          await createFeed(AI_CHAT_FEED_ID);
        } catch {
          // Feed already exists.
        }
        feedReady.current = true;
      }
      await createFeedMessage(AI_CHAT_FEED_ID, {
        sender:
          role === "assistant"
            ? { id: "grand-ai", name: "Grand AI" }
            : { id: selfId, name: selfName || "Unknown" },
        role,
        content,
        timestamp: Date.now(),
      });
    },
    [selfId, selfName, createFeed, createFeedMessage],
  );

  useEffect(() => {
    setState({ messages, currentUserId: selfId, send });
    return () =>
      setState({
        messages: [],
        currentUserId: null,
        send: async () => {
          throw new Error("Chat is not connected");
        },
      });
  }, [messages, selfId, send, setState]);

  return null;
}
