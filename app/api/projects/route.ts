import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import {
  DEFAULT_PROJECT_NAME,
  jsonError,
  readJsonBody,
  readName,
} from "@/lib/project-request";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return jsonError("Unauthorized", 401);

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ projects });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return jsonError("Unauthorized", 401);

  const body = await readJsonBody(request);
  const name = readName(body);

  if (body !== undefined && body !== null && typeof body !== "object") {
    return jsonError("Invalid request body", 400);
  }

  const project = await prisma.project.create({
    data: { ownerId: userId, name: name || DEFAULT_PROJECT_NAME },
  });

  return Response.json({ project }, { status: 201 });
}
