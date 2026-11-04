import { get, put } from "@vercel/blob";

// No `server-only` here: the generate-spec Trigger.dev task imports this too.

/** Uploads spec Markdown as a private blob and returns the URL to store as `ProjectSpec.filePath`. */
export async function saveSpecBlob(projectId: string, markdown: string) {
  const blob = await put(`specs/${projectId}/${crypto.randomUUID()}.md`, markdown, {
    access: "private",
    contentType: "text/markdown; charset=utf-8",
    addRandomSuffix: false,
  });
  return blob.url;
}

/** Reads a spec's Markdown, or null when the blob no longer exists. */
export async function readSpecBlob(url: string): Promise<string | null> {
  const result = await get(url, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) return null;
  return new Response(result.stream).text();
}
