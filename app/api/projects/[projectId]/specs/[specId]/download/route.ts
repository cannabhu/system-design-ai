import { prisma } from "@/lib/prisma";
import { getCurrentIdentity, getProjectIfAccessible } from "@/lib/project-access";
import { jsonError } from "@/lib/project-request";
import { readSpecBlob } from "@/lib/spec-storage";
import { reportApiError, withSentry } from "@/lib/sentry-capture";

type DownloadContext = RouteContext<"/api/projects/[projectId]/specs/[specId]/download">;

// Any member (owner or collaborator) can download. The Blob URL is never exposed to the client.
export const GET = withSentry(async (_request: Request, ctx: DownloadContext) => {
  const identity = await getCurrentIdentity();
  if (!identity) return jsonError("Unauthorized", 401);

  const { projectId, specId } = await ctx.params;

  const project = await getProjectIfAccessible(projectId, identity);
  if (!project) return jsonError("Forbidden", 403);

  // Scoping by projectId rejects a spec ID that belongs to a different project.
  const spec = await prisma.projectSpec.findFirst({
    where: { id: specId, projectId },
    select: { id: true, filePath: true, createdAt: true },
  });
  if (!spec) return jsonError("Spec not found", 404);

  let markdown: string | null;
  try {
    markdown = await readSpecBlob(spec.filePath);
  } catch (error) {
    reportApiError(error, projectId);
    return jsonError("Could not read the spec", 502);
  }
  if (markdown === null) return jsonError("Spec file not found", 404);

  const date = spec.createdAt.toISOString().slice(0, 10);
  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="spec-${date}.md"`,
      "Cache-Control": "private, no-store",
    },
  });
});
