import { enrichCollaborators, listCollaborators, normalizeEmail } from "@/lib/collaborators";
import { prisma } from "@/lib/prisma";
import {
  getCurrentIdentity,
  getProjectIfAccessible,
} from "@/lib/project-access";
import { INVALID_JSON, jsonError, readJsonBody } from "@/lib/project-request";

type CollaboratorsContext = RouteContext<"/api/projects/[projectId]/collaborators">;

// Any member (owner or collaborator) can view the list.
export async function GET(_request: Request, ctx: CollaboratorsContext) {
  const identity = await getCurrentIdentity();
  if (!identity) return jsonError("Unauthorized", 401);

  const { projectId } = await ctx.params;
  const project = await getProjectIfAccessible(projectId, identity);
  if (!project) return jsonError("Project not found", 404);

  return Response.json({
    role: project.role,
    collaborators: await listCollaborators(projectId),
  });
}

// Owner only.
export async function POST(request: Request, ctx: CollaboratorsContext) {
  const identity = await getCurrentIdentity();
  if (!identity) return jsonError("Unauthorized", 401);

  const { projectId } = await ctx.params;
  const project = await getProjectIfAccessible(projectId, identity);
  if (!project) return jsonError("Project not found", 404);
  if (project.role !== "owner") return jsonError("Forbidden", 403);

  const body = await readJsonBody(request);
  if (body === INVALID_JSON) return jsonError("Invalid JSON", 400);

  const email = normalizeEmail((body as { email?: unknown } | undefined)?.email);
  if (!email) return jsonError("A valid email is required", 400);
  if (email === identity.email?.toLowerCase()) {
    return jsonError("You already own this project", 400);
  }

  const existing = await prisma.projectCollaborator.findFirst({
    where: { projectId, email: { equals: email, mode: "insensitive" } },
    select: { id: true },
  });
  if (existing) return jsonError("Already a collaborator", 409);

  const row = await prisma.projectCollaborator.create({
    data: { projectId, email },
    select: { id: true, email: true },
  });
  const [collaborator] = await enrichCollaborators([row]);

  return Response.json({ collaborator }, { status: 201 });
}
