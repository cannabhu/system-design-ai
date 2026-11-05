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

/** Chat turn passed to spec generation as context. */
export const specChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  sender: z.string().optional(),
});

/** Loose canvas snapshots: the model only needs labels, shapes and connections. */
export const specNodeSchema = z
  .object({
    id: z.string(),
    data: z
      .object({ label: z.string().optional(), shape: z.string().optional() })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const specEdgeSchema = z
  .object({
    id: z.string().optional(),
    source: z.string(),
    target: z.string(),
    data: z.object({ label: z.string().optional() }).passthrough().nullish(),
  })
  .passthrough();

/** Client-supplied part of the spec request (project access is derived from `roomId`). */
export const specRequestSchema = z.object({
  roomId: z.string().min(1),
  chatHistory: z.array(specChatMessageSchema).max(200),
  nodes: z.array(specNodeSchema).max(500),
  edges: z.array(specEdgeSchema).max(1000),
});

/** Payload of the `generate-spec` Trigger.dev task. */
export const generateSpecPayloadSchema = specRequestSchema.extend({
  projectId: z.string().min(1),
});

export type GenerateSpecPayload = z.infer<typeof generateSpecPayloadSchema>;
