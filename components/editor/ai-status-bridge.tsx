"use client";

import { useContext, useEffect } from "react";
import { useFeedMessages, useOthers, useSelf } from "@liveblocks/react";

import { AiStatusContext } from "@/components/editor/ai-status-context";
import { AI_STATUS_FEED_ID, aiStatusMessageSchema } from "@/types/tasks";

/**
 * Renders nothing. Inside the room, it subscribes to shared AI activity
 * (presence `thinking` and the latest `ai-status-feed` message) and publishes
 * it to the sidebar through context.
 */
export function AiStatusBridge() {
  const { setState } = useContext(AiStatusContext);
  const selfThinking = useSelf((me) => me.presence.thinking) ?? false;
  const othersThinking = useOthers((others) =>
    others.some((other) => other.presence.thinking),
  );
  const { messages } = useFeedMessages(AI_STATUS_FEED_ID, { limit: 1 });

  const latest = messages?.reduce<(typeof messages)[number] | undefined>(
    (best, message) =>
      !best || message.createdAt >= best.createdAt ? message : best,
    undefined,
  );
  const parsed = latest ? aiStatusMessageSchema.safeParse(latest.data) : null;
  const statusText = parsed?.success ? (parsed.data.text ?? null) : null;
  const statusRunId = parsed?.success ? (parsed.data.runId ?? null) : null;
  const isGenerating = selfThinking || othersThinking;

  useEffect(() => {
    setState({ isGenerating, statusText, statusRunId });
    return () =>
      setState({ isGenerating: false, statusText: null, statusRunId: null });
  }, [isGenerating, statusText, statusRunId, setState]);

  return null;
}
