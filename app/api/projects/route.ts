import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import {
  DEFAULT_PROJECT_NAME,
  INVALID_JSON,
  jsonError,
  readJsonBody,
  hasInvalidProjectId,
  readName,
  readProjectId,
} from "@/lib/project-request";
import { withSentry } from "@/lib/sentry-capture";

export const GET = withSentry(async () => {
  const { userId } = await auth();
  if (!userId) return jsonError("Unauthorized", 401);

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ projects });
});

export const POST = withSentry(async (request: Request) => {
  const { userId } = await auth();
  if (!userId) return jsonError("Unauthorized", 401);

  const body = await readJsonBody(request);
  if (body === INVALID_JSON) return jsonError("Invalid JSON body", 400);

  const name = readName(body);

  if (body !== undefined && body !== null && typeof body !== "object") {
    return jsonError("Invalid request body", 400);
  }

  if (hasInvalidProjectId(body)) return jsonError("Invalid project id", 400);

  // The project ID doubles as the Liveblocks room ID, so the client may supply it.
  const id = readProjectId(body);
  if (id && (await prisma.project.findUnique({ where: { id } }))) {
    return jsonError("Project id already exists", 409);
  }

  const project = await prisma.project.create({
    data: { id, ownerId: userId, name: name || DEFAULT_PROJECT_NAME },
  });

  return Response.json({ project }, { status: 201 });
});
