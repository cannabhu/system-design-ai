import "server-only";

import { clerkClient } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";
import type { Collaborator } from "@/lib/projects";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && EMAIL_PATTERN.test(email) ? email : null;
}

interface ClerkProfile {
  name: string | null;
  imageUrl: string;
}

// Looks up Clerk users by email; emails without a Clerk user are simply absent.
// A Clerk outage degrades to email-only rows instead of failing the request.
async function getClerkProfiles(
  emails: string[],
): Promise<Map<string, ClerkProfile>> {
  const profiles = new Map<string, ClerkProfile>();
  if (emails.length === 0) return profiles;

  try {
    const client = await clerkClient();
    const { data: users } = await client.users.getUserList({
      emailAddress: emails,
      limit: Math.min(emails.length, 100),
    });

    for (const user of users) {
      const name =
        [user.firstName, user.lastName].filter(Boolean).join(" ") || null;
      for (const address of user.emailAddresses) {
        profiles.set(address.emailAddress.toLowerCase(), {
          name,
          imageUrl: user.imageUrl,
        });
      }
    }
  } catch {
    return profiles;
  }

  return profiles;
}

export async function enrichCollaborators(
  rows: { id: string; email: string }[],
): Promise<Collaborator[]> {
  const profiles = await getClerkProfiles(rows.map((r) => r.email));

  return rows.map((row) => {
    const profile = profiles.get(row.email.toLowerCase());
    return {
      id: row.id,
      email: row.email,
      name: profile?.name ?? null,
      imageUrl: profile?.imageUrl ?? null,
    };
  });
}

export async function listCollaborators(
  projectId: string,
): Promise<Collaborator[]> {
  const rows = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true },
  });
  return enrichCollaborators(rows);
}
