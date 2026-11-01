import "server-only";

import { cache } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export interface CurrentIdentity {
  userId: string;
  email: string | null;
}

export interface AccessibleProject {
  id: string;
  name: string;
  role: "owner" | "collaborator";
}

// Cached per request so the editor layout and page share one Clerk lookup.
export const getCurrentIdentity = cache(async (): Promise<CurrentIdentity | null> => {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  return {
    userId,
    email: user?.primaryEmailAddress?.emailAddress ?? null,
  };
});

/** Returns the project when the identity owns it or is a collaborator, otherwise null. */
export async function getProjectIfAccessible(
  projectId: string,
  identity: CurrentIdentity,
): Promise<AccessibleProject | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      ownerId: true,
      collaborators: identity.email
        ? {
            where: { email: { equals: identity.email, mode: "insensitive" } },
            select: { id: true },
          }
        : false,
    },
  });
  if (!project) return null;

  if (project.ownerId === identity.userId) {
    return { id: project.id, name: project.name, role: "owner" };
  }
  if (project.collaborators && project.collaborators.length > 0) {
    return { id: project.id, name: project.name, role: "collaborator" };
  }
  return null;
}
