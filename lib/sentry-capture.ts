import * as Sentry from "@sentry/nextjs";

import { jsonError } from "@/lib/project-request";

// Report only the project ID as a tag; never prompts, chat, canvas or spec content.
export function reportApiError(error: unknown, projectId?: string) {
  Sentry.captureException(error, projectId ? { tags: { projectId } } : undefined);
}

export interface SentryTags {
  projectId?: string;
}

type Params = Promise<Record<string, string | string[] | undefined>>;

// Wraps a route handler so unexpected throws (5xx) reach Sentry. Expected
// 4xx responses are returned by the handler and never captured. Handlers that
// know the project ID outside route params can set `tags.projectId`.
export function withSentry<C extends { params: Params }>(
  handler: (request: Request, ctx: C, tags: SentryTags) => Promise<Response>,
) {
  return async (request: Request, ctx: C): Promise<Response> => {
    const tags: SentryTags = {};
    try {
      return await handler(request, ctx, tags);
    } catch (error) {
      if (!tags.projectId) {
        const id = (await ctx?.params?.catch(() => undefined))?.projectId;
        if (typeof id === "string") tags.projectId = id;
      }
      reportApiError(error, tags.projectId);
      return jsonError("Internal server error", 500);
    }
  };
}
