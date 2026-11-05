import { tasks } from "@trigger.dev/sdk";

import type { generateSpecTask } from "@/trigger/generate-spec";
import { prisma } from "@/lib/prisma";
import { getCurrentIdentity, getProjectIfAccessible } from "@/lib/project-access";
import { INVALID_JSON, jsonError, readJsonBody } from "@/lib/project-request";
import { specRequestSchema } from "@/types/tasks";
import { withSentry } from "@/lib/sentry-capture";

export const POST = withSentry(async (request: Request, _ctx, tags) => {
  const identity = await getCurrentIdentity();
  if (!identity) return jsonError("Unauthorized", 401);

  const body = await readJsonBody(request);
  if (body === INVALID_JSON) return jsonError("Invalid JSON", 400);

  const parsed = specRequestSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid request", 400);
  const { roomId, chatHistory, nodes, edges } = parsed.data;

  // The project ID is the Liveblocks room ID; access comes from user + room only.
  tags.projectId = roomId;
  const project = await getProjectIfAccessible(roomId, identity);
  if (!project) return jsonError("Forbidden", 403);

  const handle = await tasks.trigger<typeof generateSpecTask>("generate-spec", {
    projectId: project.id,
    roomId,
    chatHistory,
    nodes,
    edges,
  });

  await prisma.taskRun.create({
    data: { runId: handle.id, projectId: project.id, userId: identity.userId },
  });

  return Response.json({ runId: handle.id });
});
