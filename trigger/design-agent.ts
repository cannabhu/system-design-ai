import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { Liveblocks } from "@liveblocks/node";
import { mutateFlow } from "@liveblocks/react-flow/node";
import { logger, task } from "@trigger.dev/sdk";
import { APICallError, generateText, Output } from "ai";
import { z } from "zod";
import type { MarkerType } from "@xyflow/react";

import {
  DEFAULT_NODE_COLOR,
  NODE_COLORS,
  NODE_SHAPES,
  type CanvasEdge,
  type CanvasNode,
  type CanvasNodeShape,
} from "@/types/canvas";
import { AI_STATUS_FEED_ID } from "@/types/tasks";

export interface DesignAgentPayload {
  prompt: string;
  roomId: string;
}

const MODEL_ID = "gemini-3.8-flash";
// Tried in order when the primary model is overloaded or rate limited.
const FALLBACK_MODEL_IDS = [
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-flash-latest",
];
const MODEL_MAX_RETRIES = 2;
const MAX_ACTIONS = 80;
const GRID = 20;
const MIN_NODE_WIDTH = 60;
const MIN_NODE_HEIGHT = 40;
const EDGE_COLOR = "#f8fafc";
const STATUS_FEED_ID = AI_STATUS_FEED_ID;

// Grand AI participant shown in the room's presence (avatars + live cursor).
const AI_USER_ID = "grand-ai";
const AI_USER_INFO = { name: "Grand AI", color: "#8B5CF6" };
const AI_PRESENCE_TTL_SECONDS = 60;
const AI_PRESENCE_CLEAR_TTL_SECONDS = 2;

const DEFAULT_SIZES: Record<CanvasNodeShape, { width: number; height: number }> = {
  rectangle: { width: 160, height: 80 },
  diamond: { width: 160, height: 120 },
  circle: { width: 100, height: 100 },
  pill: { width: 160, height: 64 },
  cylinder: { width: 120, height: 100 },
  hexagon: { width: 140, height: 120 },
};

const COLOR_FILLS = NODE_COLORS.map((c) => c.fill) as [string, ...string[]];

// Flat schema (no unions) keeps Gemini's structured output reliable.
const actionSchema = z.object({
  type: z.enum([
    "add_node",
    "move_node",
    "resize_node",
    "update_node",
    "delete_node",
    "add_edge",
    "delete_edge",
  ]),
  id: z
    .string()
    .describe(
      "Node id (add_node: a new unique short id; others: an existing node id) or edge id (delete_edge).",
    ),
  shape: z.enum(NODE_SHAPES).optional().describe("add_node / update_node"),
  label: z.string().optional().describe("add_node / update_node / add_edge"),
  color: z.enum(COLOR_FILLS).optional().describe("add_node / update_node fill color"),
  x: z.number().optional().describe("add_node / move_node, top-left"),
  y: z.number().optional().describe("add_node / move_node, top-left"),
  width: z.number().optional().describe("add_node / resize_node"),
  height: z.number().optional().describe("add_node / resize_node"),
  source: z.string().optional().describe("add_edge: source node id"),
  target: z.string().optional().describe("add_edge: target node id"),
});

const planSchema = z.object({
  summary: z
    .string()
    .describe(
      "2-3 sentences, written to the user, describing what was designed: the key components, how they connect, and any notable choices (caching, queues, storage).",
    ),
  actions: z.array(actionSchema),
});

type Action = z.infer<typeof actionSchema>;

function getLiveblocksClient(): Liveblocks {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!secret) throw new Error("LIVEBLOCKS_SECRET_KEY is not set");
  return new Liveblocks({ secret });
}

function snap(value: number): number {
  return Math.round(value / GRID) * GRID;
}

function buildSystemPrompt(): string {
  const palette = NODE_COLORS.map((c) => c.fill).join(", ");
  return `You are Grand AI, a system design assistant that edits a collaborative architecture canvas.
Translate the user's request into a list of canvas actions.

Action types: add_node, move_node, resize_node, update_node, delete_node, add_edge, delete_edge.
- Order matters: add nodes before edges that reference them.
- New node ids must be short, unique, lowercase (e.g. "api-gateway"). Edges must reference existing or newly added node ids.
- Only modify or delete existing elements when the request asks for it; otherwise extend the existing design.

Rules:
- Shapes (only these): ${NODE_SHAPES.join(", ")}.
  Use rectangle for services, cylinder for databases/storage, diamond for decisions/routers, hexagon for gateways/load balancers, pill for clients/users/external actors, circle for queues/events.
- Colors (fill values only, only these): ${palette}.
  Group by role: services blue (${NODE_COLORS[1].fill}), gateways purple (${NODE_COLORS[2].fill}), storage green (${NODE_COLORS[6].fill}), queues/async orange (${NODE_COLORS[3].fill}), caches teal (${NODE_COLORS[7].fill}), failures/alerts red (${NODE_COLORS[4].fill}), clients/neutral ${DEFAULT_NODE_COLOR.fill}.
- Default sizes: ${Object.entries(DEFAULT_SIZES)
    .map(([s, d]) => `${s} ${d.width}x${d.height}`)
    .join(", ")}. Omit width/height unless a custom size is needed.
- Layout: coordinates are the node's top-left corner, multiples of ${GRID}. Flow left to right in columns about 280px apart, with rows about 160px apart, nodes never overlapping, at least 80px gap between nodes. Place new nodes clear of existing ones.
- Labels: short (1-3 words) and descriptive. Edge labels are optional and brief (e.g. "HTTP", "publish").
- Use at most ${MAX_ACTIONS} actions.`;
}

function describeCanvas(nodes: readonly CanvasNode[], edges: readonly CanvasEdge[]): string {
  if (nodes.length === 0 && edges.length === 0) return "The canvas is empty.";
  const n = nodes.map((node) => ({
    id: node.id,
    shape: node.data.shape,
    label: node.data.label,
    color: node.data.color,
    x: Math.round(node.position.x),
    y: Math.round(node.position.y),
    width: node.width ?? node.measured?.width,
    height: node.height ?? node.measured?.height,
  }));
  const e = edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.data?.label,
  }));
  return `Current canvas:\nnodes: ${JSON.stringify(n)}\nedges: ${JSON.stringify(e)}`;
}

function pickHandles(from: CanvasNode, to: CanvasNode) {
  const fw = from.width ?? DEFAULT_SIZES[from.data.shape].width;
  const fh = from.height ?? DEFAULT_SIZES[from.data.shape].height;
  const tw = to.width ?? DEFAULT_SIZES[to.data.shape].width;
  const th = to.height ?? DEFAULT_SIZES[to.data.shape].height;
  const dx = to.position.x + tw / 2 - (from.position.x + fw / 2);
  const dy = to.position.y + th / 2 - (from.position.y + fh / 2);
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0
      ? { sourceHandle: "right", targetHandle: "left" }
      : { sourceHandle: "left", targetHandle: "right" };
  }
  return dy >= 0
    ? { sourceHandle: "bottom", targetHandle: "top" }
    : { sourceHandle: "top", targetHandle: "bottom" };
}

function describeAction(action: Action): string {
  switch (action.type) {
    case "add_node":
      return `Adding ${action.label || action.shape || "node"}`;
    case "move_node":
      return "Repositioning a node";
    case "resize_node":
      return "Resizing a node";
    case "update_node":
      return `Updating ${action.label || "a node"}`;
    case "delete_node":
      return "Removing a node";
    case "add_edge":
      return "Connecting nodes";
    case "delete_edge":
      return "Removing a connection";
  }
}

export const designAgentTask = task({
  id: "design-agent",
  maxDuration: 300,
  // Retrying would re-apply actions to the shared canvas.
  retry: { maxAttempts: 1 },
  run: async (payload: DesignAgentPayload, { ctx }) => {
    const { prompt, roomId } = payload;
    const liveblocks = getLiveblocksClient();
    const runId = ctx.run.id;

    const setPresence = (
      data: { cursor: { x: number; y: number } | null; thinking: boolean },
      ttl = AI_PRESENCE_TTL_SECONDS,
    ) =>
      liveblocks
        .setPresence(roomId, {
          userId: AI_USER_ID,
          data,
          userInfo: AI_USER_INFO,
          ttl,
        })
        .catch((error) => logger.warn("Failed to update AI presence", { error: String(error) }));

    const postStatus = async (
      status: "started" | "processing" | "complete" | "error",
      message: string,
    ) => {
      try {
        await liveblocks.createFeedMessage({
          roomId,
          feedId: STATUS_FEED_ID,
          data: { runId, status, text: message, author: AI_USER_INFO.name },
        });
      } catch (error) {
        logger.warn("Failed to post AI status", { error: String(error) });
      }
    };

    try {
      try {
        await liveblocks.createFeed({ roomId, feedId: STATUS_FEED_ID });
      } catch {
        // Feed already exists.
      }

      await setPresence({ cursor: null, thinking: true });
      await postStatus("started", "Grand AI is thinking about your request…");

      // Read the current canvas through the shared flow.
      await postStatus("processing", "Reading the current canvas…");
      let nodes: readonly CanvasNode[] = [];
      let edges: readonly CanvasEdge[] = [];
      await mutateFlow<CanvasNode, CanvasEdge>({ client: liveblocks, roomId }, (flow) => {
        nodes = flow.nodes;
        edges = flow.edges;
      });

      await postStatus("processing", "Planning the architecture…");

      const google = createGoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_AI_API_KEY,
      });
      let output: z.infer<typeof planSchema> | undefined;
      let lastError: unknown;
      for (const modelId of [MODEL_ID, ...FALLBACK_MODEL_IDS]) {
        try {
          const result = await generateText({
            model: google(modelId),
            system: buildSystemPrompt(),
            prompt: `${describeCanvas(nodes, edges)}\n\nUser request: ${prompt}`,
            output: Output.object({ schema: planSchema }),
            maxRetries: MODEL_MAX_RETRIES,
          });
          output = result.output;
          break;
        } catch (error) {
          lastError = error;
          logger.warn("Model call failed", { modelId, error: String(error) });
          // A bad request will fail on every model, so only fall back on transient errors.
          if (APICallError.isInstance(error) && !error.isRetryable) throw error;
        }
      }
      if (!output) throw lastError;

      const actions = output.actions.slice(0, MAX_ACTIONS);
      await postStatus("processing", `Plan ready: applying ${actions.length} changes to the canvas…`);

      let applied = 0;
      let skipped = 0;

      for (const [index, action] of actions.entries()) {
        await mutateFlow<CanvasNode, CanvasEdge>({ client: liveblocks, roomId }, (flow) => {
          let cursor: { x: number; y: number } | null = null;

          switch (action.type) {
            case "add_node": {
              const shape = action.shape ?? "rectangle";
              const size = DEFAULT_SIZES[shape];
              const id = flow.getNode(action.id) ? `${action.id}-${index}` : action.id;
              const position = { x: snap(action.x ?? 0), y: snap(action.y ?? 0) };
              flow.addNode({
                id,
                type: "canvasNode",
                position,
                width: Math.max(MIN_NODE_WIDTH, action.width ?? size.width),
                height: Math.max(MIN_NODE_HEIGHT, action.height ?? size.height),
                data: {
                  label: action.label ?? "",
                  color: action.color ?? DEFAULT_NODE_COLOR.fill,
                  shape,
                },
              });
              // Later actions refer to the id the model chose.
              if (id !== action.id) {
                for (const later of actions.slice(index + 1)) {
                  if (later.id === action.id) later.id = id;
                  if (later.source === action.id) later.source = id;
                  if (later.target === action.id) later.target = id;
                }
              }
              cursor = position;
              break;
            }
            case "move_node": {
              const node = flow.getNode(action.id);
              if (!node || action.x === undefined || action.y === undefined) return void skipped++;
              cursor = { x: snap(action.x), y: snap(action.y) };
              flow.updateNode(action.id, { position: cursor });
              break;
            }
            case "resize_node": {
              const node = flow.getNode(action.id);
              if (!node || (action.width === undefined && action.height === undefined)) {
                return void skipped++;
              }
              flow.updateNode(action.id, {
                width: Math.max(MIN_NODE_WIDTH, action.width ?? node.width ?? DEFAULT_SIZES[node.data.shape].width),
                height: Math.max(MIN_NODE_HEIGHT, action.height ?? node.height ?? DEFAULT_SIZES[node.data.shape].height),
              });
              cursor = node.position;
              break;
            }
            case "update_node": {
              const node = flow.getNode(action.id);
              if (!node) return void skipped++;
              flow.updateNodeData(action.id, {
                ...(action.label !== undefined && { label: action.label }),
                ...(action.color !== undefined && { color: action.color }),
                ...(action.shape !== undefined && { shape: action.shape }),
              });
              cursor = node.position;
              break;
            }
            case "delete_node": {
              const node = flow.getNode(action.id);
              if (!node) return void skipped++;
              cursor = node.position;
              // Drop connected edges so none are left dangling.
              flow.removeEdges(
                flow.edges.filter((e) => e.source === action.id || e.target === action.id).map((e) => e.id),
              );
              flow.removeNode(action.id);
              break;
            }
            case "add_edge": {
              const from = action.source ? flow.getNode(action.source) : undefined;
              const to = action.target ? flow.getNode(action.target) : undefined;
              if (!from || !to || from.id === to.id) return void skipped++;
              const id = `edge-${from.id}-${to.id}`;
              flow.addEdge({
                id,
                type: "canvasEdge",
                source: from.id,
                target: to.id,
                ...pickHandles(from, to),
                ...(action.label ? { data: { label: action.label } } : {}),
                style: {
                  stroke: EDGE_COLOR,
                  strokeWidth: 1.5,
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                },
                markerEnd: { type: "arrowclosed" as MarkerType.ArrowClosed, color: EDGE_COLOR },
              });
              cursor = { x: (from.position.x + to.position.x) / 2, y: (from.position.y + to.position.y) / 2 };
              break;
            }
            case "delete_edge": {
              if (!flow.getEdge(action.id)) return void skipped++;
              flow.removeEdge(action.id);
              break;
            }
          }

          applied++;
          if (cursor) void setPresence({ cursor, thinking: true });
        });

        // Skip the last action: the "complete" status follows right away.
        if (index < actions.length - 1) {
          await postStatus("processing", `${describeAction(action)} (${index + 1}/${actions.length})`);
        }
      }

      await postStatus(
        "complete",
        skipped > 0
          ? `${output.summary} (${applied} changes applied, ${skipped} skipped)`
          : `${output.summary} (${applied} changes applied)`,
      );
      return { summary: output.summary, applied, skipped, roomId };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error("Design agent failed", { error: message, roomId });
      await postStatus("error", "Grand AI couldn't finish this request. Please try again.");
      throw error;
    } finally {
      // Short TTL so the AI participant leaves the room right away.
      await setPresence({ cursor: null, thinking: false }, AI_PRESENCE_CLEAR_TTL_SECONDS);
    }
  },
});
