import * as Sentry from "@sentry/nextjs";

import { getSentryOptions } from "@/lib/sentry-options";

let initialized = false;

// Inits Sentry once per worker process from SENTRY_DSN.
export function initSentry() {
  if (initialized) return;
  initialized = true;
  Sentry.init({ ...getSentryOptions(process.env.SENTRY_DSN), tracesSampleRate: 0 });
}

// Reports a failed task with ids only; never the payload, prompts or content.
export async function captureTaskFailure({
  error,
  taskId,
  runId,
  payload,
}: {
  error: unknown;
  taskId: string;
  runId: string;
  payload: unknown;
}) {
  initSentry();

  // design-agent uses roomId (the project ID); generate-spec carries projectId.
  const ids = (typeof payload === "object" && payload !== null ? payload : {}) as {
    projectId?: unknown;
    roomId?: unknown;
  };
  const projectId =
    typeof ids.projectId === "string"
      ? ids.projectId
      : typeof ids.roomId === "string"
        ? ids.roomId
        : undefined;

  Sentry.captureException(error, {
    tags: { task: taskId, runId, ...(projectId ? { projectId } : {}) },
  });
  await Sentry.flush(2000);
}
