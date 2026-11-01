export type ProjectRole = "owner" | "collaborator";

export interface Project {
  id: string;
  name: string;
  role: ProjectRole;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Project ID and Liveblocks room ID: the slugified name plus a short unique suffix. */
export function createRoomId(name: string): string {
  const suffix = crypto.randomUUID().replace(/-/g, "").slice(0, 6);
  const base = slugify(name).slice(0, 80).replace(/-+$/g, "");
  return `${base}-${suffix}`;
}

export interface Collaborator {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
}
