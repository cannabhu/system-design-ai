import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { attemptRoomCleanup } from "@/lib/liveblocks-cleanup";
import { jsonError, readJsonBody, readName } from "@/lib/project-request";

type ProjectContext = RouteContext<"/api/projects/[projectId]">;

async function findOwnership(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });

  if (!project) return jsonError("Project not found", 404);
  if (project.ownerId !== userId) return jsonError("Forbidden", 403);
  return null;
}

export async function PATCH(request: Request, ctx: ProjectContext) {
  const { userId } = await auth();
  if (!userId) return jsonError("Unauthorized", 401);

  const { projectId } = await ctx.params;
  const denied = await findOwnership(projectId, userId);
  if (denied) return denied;

  const name = readName(await readJsonBody(request));
  if (!name) return jsonError("Project name is required", 400);

  const project = await prisma.project.update({
    where: { id: projectId },
    data: { name },
  });

  return Response.json({ project });
}

export async function DELETE(_request: Request, ctx: ProjectContext) {
  const { userId } = await auth();
  if (!userId) return jsonError("Unauthorized", 401);

  const { projectId } = await ctx.params;
  const denied = await findOwnership(projectId, userId);
  if (denied) return denied;

  await prisma.$transaction([
   prisma.project.delete({ where: { id: projectId } }),
   prisma.liveblocksRoomCleanup.create({ data: { roomId: projectId } }),
 ]);

  // The outbox row keeps the cleanup queued if this attempt fails.
  try {
    await attemptRoomCleanup(projectId);
  } catch (error) {
    console.warn(`Liveblocks cleanup deferred for room ${projectId}`, error);
 }

  return new Response(null, { status: 204 });
}
