export type ProjectRole = "owner" | "collaborator";

export interface Project {
  id: string;
  name: string;
  slug: string;
  role: ProjectRole;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const MOCK_PROJECTS: Project[] = [
  { id: "p1", name: "URL Shortener", slug: "url-shortener", role: "owner" },
  { id: "p2", name: "Chat Platform", slug: "chat-platform", role: "owner" },
  {
    id: "p3",
    name: "Video Streaming",
    slug: "video-streaming",
    role: "collaborator",
  },
];
