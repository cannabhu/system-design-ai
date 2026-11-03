import { tasks } from "@trigger.dev/sdk";

import type { designAgentTask } from "@/trigger/design-agent";
import { prisma } from "@/lib/prisma";
import { getCurrentIdentity, getProjectIfAccessible } from "@/lib/project-access";
import { INVALID_JSON, jsonError, readJsonBody } from "@/lib/project-request";

export async function POST(request: Request) {
  const identity = await getCurrentIdentity();
  if (!identity) return jsonError("Unauthorized", 401);

  const body = await readJsonBody(request);
  if (body === INVALID_JSON) return jsonError("Invalid JSON", 400);
  const { prompt, roomId, projectId } =
    typeof body === "object" && body !== null
      ? (body as { prompt?: unknown; roomId?: unknown; projectId?: unknown })
      : {};

  if (typeof prompt !== "string" || prompt.trim() === "") {
    return jsonError("Prompt is required", 400);
  }
  if (typeof roomId !== "string" || roomId === "") {
    return jsonError("Room ID is required", 400);
  }
  if (typeof projectId !== "string" || projectId === "") {
    return jsonError("Project ID is required", 400);
  }
  // The project ID is the Liveblocks room ID.
  if (roomId !== projectId) return jsonError("Room does not match project", 400);

  const project = await getProjectIfAccessible(projectId, identity);
  if (!project) return jsonError("Forbidden", 403);

  const handle = await tasks.trigger<typeof designAgentTask>("design-agent", {
    prompt: prompt.trim(),
    roomId,
  });

  await prisma.taskRun.create({
    data: { runId: handle.id, projectId: project.id, userId: identity.userId },
  });

  return Response.json({ runId: handle.id });
}
