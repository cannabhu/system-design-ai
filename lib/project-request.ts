export const DEFAULT_PROJECT_NAME = "Untitled Project";

export function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

export function readName(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null) return undefined;
  const { name } = body as { name?: unknown };
  return typeof name === "string" ? name.trim() : undefined;
}
