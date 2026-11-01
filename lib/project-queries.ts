import "server-only";

import { prisma } from "@/lib/prisma";
import type { Project } from "@/lib/projects";

export async function getOwnedProjects(userId: string): Promise<Project[]> {
  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
  });

  return projects.map((p) => ({ ...p, role: "owner" }));
}

export async function getSharedProjects(email: string): Promise<Project[]> {
  const projects = await prisma.project.findMany({
    where: {
      collaborators: { some: { email: { equals: email, mode: "insensitive" } } },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
  });

  return projects.map((p) => ({ ...p, role: "collaborator" }));
}
