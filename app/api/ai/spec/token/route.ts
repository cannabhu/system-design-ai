import { auth } from "@trigger.dev/sdk";

import { prisma } from "@/lib/prisma";
import { getCurrentIdentity } from "@/lib/project-access";
import { INVALID_JSON, jsonError, readJsonBody } from "@/lib/project-request";
import { withSentry } from "@/lib/sentry-capture";

export const POST = withSentry(async (request: Request) => {
  const identity = await getCurrentIdentity();
  if (!identity) return jsonError("Unauthorized", 401);

  const body = await readJsonBody(request);
  if (body === INVALID_JSON) return jsonError("Invalid JSON", 400);
  const runId =
    typeof body === "object" && body !== null
      ? (body as { runId?: unknown }).runId
      : undefined;
  if (typeof runId !== "string" || runId === "") {
    return jsonError("Run ID is required", 400);
  }

  const taskRun = await prisma.taskRun.findUnique({
    where: { runId },
    select: { userId: true },
  });
  if (!taskRun) return jsonError("Run not found", 404);
  if (taskRun.userId !== identity.userId) return jsonError("Forbidden", 403);

  const token = await auth.createPublicToken({
    scopes: { read: { runs: [runId] } },
    expirationTime: "1h",
  });

  return Response.json({ token });
});
