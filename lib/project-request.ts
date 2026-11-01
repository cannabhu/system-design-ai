export const DEFAULT_PROJECT_NAME = "Untitled Project";

export function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export const INVALID_JSON = Symbol("invalid-json");

// Returns undefined for an empty body, INVALID_JSON for malformed JSON.
export async function readJsonBody(
  request: Request,
): Promise<unknown | typeof INVALID_JSON> {
  const text = await request.text();
  if (text.trim() === "") return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return INVALID_JSON;
  }
}

const MAX_PROJECT_NAME_LENGTH = 100;

export function readName(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null) return undefined;
  const { name } = body as { name?: unknown };
  return typeof name === "string" ? name.trim().slice(0, MAX_PROJECT_NAME_LENGTH) : undefined;
}

const PROJECT_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,99}$/;

export function readProjectId(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null) return undefined;
  const { id } = body as { id?: unknown };
  if (typeof id !== "string") return undefined;
  const trimmed = id.trim();
  return PROJECT_ID_PATTERN.test(trimmed) ? trimmed : undefined;
}

export function hasInvalidProjectId(body: unknown): boolean {
  if (typeof body !== "object" || body === null) return false;
  const { id } = body as { id?: unknown };
  return id !== undefined && readProjectId(body) === undefined;
}
