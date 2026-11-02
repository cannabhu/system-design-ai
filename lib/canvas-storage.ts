import "server-only";

import { get, put } from "@vercel/blob";

import type { CanvasSnapshot } from "@/types/canvas";

// One stable pathname per project; each save overwrites the previous snapshot.
function canvasPathname(projectId: string) {
  return `canvas/${projectId}.json`;
}

/** Uploads the canvas JSON and returns the blob URL to store on the project. */
export async function saveCanvasBlob(projectId: string, snapshot: CanvasSnapshot) {
  const blob = await put(canvasPathname(projectId), JSON.stringify(snapshot), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return blob.url;
}

/** Reads the saved canvas JSON, or null when the blob no longer exists. */
export async function readCanvasBlob(url: string): Promise<unknown | null> {
  const result = await get(url, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) return null;
  return JSON.parse(await new Response(result.stream).text());
}
