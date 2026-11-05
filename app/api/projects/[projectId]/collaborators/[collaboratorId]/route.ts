import { prisma } from "@/lib/prisma";
import {
  getCurrentIdentity,
  getProjectIfAccessible,
} from "@/lib/project-access";
import { jsonError } from "@/lib/project-request";
import { withSentry } from "@/lib/sentry-capture";

type CollaboratorContext =
  RouteContext<"/api/projects/[projectId]/collaborators/[collaboratorId]">;

// Owner only.
export const DELETE = withSentry(async (_request: Request, ctx: CollaboratorContext) => {
  const identity = await getCurrentIdentity();
  if (!identity) return jsonError("Unauthorized", 401);

  const { projectId, collaboratorId } = await ctx.params;
  const project = await getProjectIfAccessible(projectId, identity);
  if (!project) return jsonError("Project not found", 404);
  if (project.role !== "owner") return jsonError("Forbidden", 403);

  const { count } = await prisma.projectCollaborator.deleteMany({
    where: { id: collaboratorId, projectId },
  });
  if (count === 0) return jsonError("Collaborator not found", 404);

  return new Response(null, { status: 204 });
});
