import { prisma } from "@/lib/prisma";
import { getCurrentIdentity, getProjectIfAccessible } from "@/lib/project-access";
import { jsonError } from "@/lib/project-request";

type SpecsContext = RouteContext<"/api/projects/[projectId]/specs">;

// Metadata only. Content is fetched through the download route; the Blob path is never returned.
export async function GET(_request: Request, ctx: SpecsContext) {
  const identity = await getCurrentIdentity();
  if (!identity) return jsonError("Unauthorized", 401);

  const { projectId } = await ctx.params;

  const project = await getProjectIfAccessible(projectId, identity);
  if (!project) return jsonError("Forbidden", 403);

  const specs = await prisma.projectSpec.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    select: { id: true, createdAt: true },
  });

  return Response.json({
    specs: specs.map((spec) => ({
      id: spec.id,
      createdAt: spec.createdAt.toISOString(),
    })),
  });
}
