import { readCanvasBlob, saveCanvasBlob } from "@/lib/canvas-storage";
import { prisma } from "@/lib/prisma";
import {
  getCurrentIdentity,
  getProjectIfAccessible,
} from "@/lib/project-access";
import { INVALID_JSON, jsonError, readJsonBody } from "@/lib/project-request";
import type { CanvasSnapshot } from "@/types/canvas";
import { reportApiError, withSentry } from "@/lib/sentry-capture";

type CanvasContext = RouteContext<"/api/projects/[projectId]/canvas">;

function readSnapshot(body: unknown): CanvasSnapshot | null {
  if (typeof body !== "object" || body === null) return null;
  const { nodes, edges } = body as { nodes?: unknown; edges?: unknown };
  if (!Array.isArray(nodes) || !Array.isArray(edges)) return null;
  return { nodes, edges } as CanvasSnapshot;
}

// Any member (owner or collaborator) can load the saved canvas.
export const GET = withSentry(async (_request: Request, ctx: CanvasContext) => {
  const identity = await getCurrentIdentity();
  if (!identity) return jsonError("Unauthorized", 401);

  const { projectId } = await ctx.params;
  const project = await getProjectIfAccessible(projectId, identity);
  if (!project) return jsonError("Project not found", 404);

  const record = await prisma.project.findUnique({
    where: { id: projectId },
    select: { canvasJsonPath: true },
  });
  if (!record?.canvasJsonPath) return Response.json({ canvas: null });

  try {
    const saved = readSnapshot(await readCanvasBlob(record.canvasJsonPath));
    return Response.json({ canvas: saved });
  } catch (error) {
    reportApiError(error, projectId);
    return jsonError("Could not read the saved canvas", 502);
  }
});

// Any member (owner or collaborator) can save, since they can all edit.
export const PUT = withSentry(async (request: Request, ctx: CanvasContext) => {
  const identity = await getCurrentIdentity();
  if (!identity) return jsonError("Unauthorized", 401);

  const { projectId } = await ctx.params;
  const project = await getProjectIfAccessible(projectId, identity);
  if (!project) return jsonError("Project not found", 404);

  const body = await readJsonBody(request);
  if (body === INVALID_JSON) return jsonError("Invalid JSON", 400);
  const snapshot = readSnapshot(body);
  if (!snapshot) return jsonError("nodes and edges arrays are required", 400);

  try {
    const url = await saveCanvasBlob(projectId, snapshot);
    await prisma.project.update({
      where: { id: projectId },
      data: { canvasJsonPath: url },
    });
  } catch (error) {
    reportApiError(error, projectId);
    return jsonError("Could not save the canvas", 502);
  }
  return Response.json({ saved: true });
});
