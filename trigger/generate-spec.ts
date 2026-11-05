import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { logger, metadata, schemaTask } from "@trigger.dev/sdk";
import { APICallError, generateText } from "ai";

import { prisma } from "@/lib/prisma";
import { saveSpecBlob } from "@/lib/spec-storage";
import { generateSpecPayloadSchema, type GenerateSpecPayload } from "@/types/tasks";

const MODEL_ID = "gemini-3.8-flash";
// Tried in order when the primary model is overloaded or rate limited.
const FALLBACK_MODEL_IDS = ["gemini-3.7-flash", "gemini-3.6-flash", "gemini-flash-latest"];
const MODEL_MAX_RETRIES = 2;

const SYSTEM_PROMPT = `You are Grand AI, a senior software architect. Write a technical specification in Markdown for the system described by the canvas (components and connections) and the team's chat.

Use these sections, skipping any that do not apply:
# <System name>
## Overview
## Architecture (components, responsibilities, how they connect; use the connection labels)
## Data Flow
## Data Model
## APIs & Interfaces
## Scalability & Reliability
## Security
## Risks & Open Questions

Base the spec on the canvas and chat. Mark reasonable assumptions as assumptions and do not invent components the canvas does not imply. Output only Markdown, with no code fence around the whole document.`;

function describeContext(p: GenerateSpecPayload): string {
  const labelOf = new Map(p.nodes.map((n) => [n.id, n.data?.label?.trim() || n.id]));
  const nodes = p.nodes.map(
    (n) => `- ${labelOf.get(n.id)}${n.data?.shape ? ` (${n.data.shape})` : ""}`,
  );
  const edges = p.edges.map((e) => {
    const label = e.data?.label?.trim();
    return `- ${labelOf.get(e.source) ?? e.source} -> ${labelOf.get(e.target) ?? e.target}${
      label ? ` [${label}]` : ""
    }`;
  });
  const chat = p.chatHistory.map((m) => `${m.sender ?? m.role}: ${m.content}`);
  return [
    `Components:\n${nodes.join("\n") || "(none)"}`,
    `Connections:\n${edges.join("\n") || "(none)"}`,
    `Chat history:\n${chat.join("\n") || "(none)"}`,
  ].join("\n\n");
}

export const generateSpecTask = schemaTask({
  id: "generate-spec",
  schema: generateSpecPayloadSchema,
  maxDuration: 300,
  // A retry after a failed save only regenerates; nothing is persisted until the end.
  retry: { maxAttempts: 2 },
  run: async (payload, { ctx }) => {
    const { projectId, roomId } = payload;
    metadata.set("status", "started").set("message", "Reading the canvas and chat…");
    logger.info("Generating spec", {
      runId: ctx.run.id,
      projectId,
      roomId,
      nodes: payload.nodes.length,
      edges: payload.edges.length,
    });

    try {
      metadata.set("status", "processing").set("message", "Writing the technical spec…");

      const google = createGoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_AI_API_KEY,
      });
      let content: string | undefined;
      let lastError: unknown;
      for (const modelId of [MODEL_ID, ...FALLBACK_MODEL_IDS]) {
        try {
          const result = await generateText({
            model: google(modelId),
            system: SYSTEM_PROMPT,
            prompt: describeContext(payload),
            maxRetries: MODEL_MAX_RETRIES,
          });
          content = result.text.trim();
          break;
        } catch (error) {
          lastError = error;
          logger.warn("Model call failed", { modelId, error: String(error) });
          // A bad request will fail on every model, so only fall back on transient errors.
          if (APICallError.isInstance(error) && !error.isRetryable && error.statusCode !== 404) {
            throw error;
          }
        }
      }
      if (!content) throw lastError ?? new Error("The model returned an empty spec");

      // Content goes to Blob; Prisma keeps only the metadata and the blob URL.
      metadata.set("message", "Saving the spec…");
      const filePath = await saveSpecBlob(projectId, content);
      const spec = await prisma.projectSpec.create({
        data: { projectId, filePath },
        select: { id: true },
      });

      metadata
        .set("status", "complete")
        .set("message", "Spec ready")
        .set("specId", spec.id);
      return content;
    } catch (error) {
      logger.error("Spec generation failed", { error: String(error), projectId });
      metadata.set("status", "error").set("message", "Spec generation failed");
      throw error;
    }
  },
});
