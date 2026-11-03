import { z } from "zod";

/** Liveblocks feed that carries shared AI activity status for a room. */
export const AI_STATUS_FEED_ID = "ai-status-feed";

/** Payload of a message in the AI status feed. Generic across design/spec generation. */
export const aiStatusMessageSchema = z.object({
  text: z.string().optional(),
  /** Trigger.dev run that posted the message, to ignore stale messages. */
  runId: z.string().optional(),
});

export type AiStatusMessage = z.infer<typeof aiStatusMessageSchema>;

/** Liveblocks feed that carries collaborative sidebar chat for a room. Separate from `AI_STATUS_FEED_ID`. */
export const AI_CHAT_FEED_ID = "ai-chat";

/** Payload of a message in the `ai-chat` feed. */
export const aiChatMessageSchema = z.object({
  sender: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
  }),
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1),
  timestamp: z.number(),
});

export type AiChatMessage = z.infer<typeof aiChatMessageSchema>;

/** Liveblocks feed for human-to-human chat between collaborators. Separate from `AI_CHAT_FEED_ID`. */
export const TEAM_CHAT_FEED_ID = "team-chat";

/** Payload of a message in the `team-chat` feed. */
export const teamChatMessageSchema = z.object({
  sender: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
  }),
  content: z.string().trim().min(1),
  timestamp: z.number(),
});

export type TeamChatMessage = z.infer<typeof teamChatMessageSchema>;
