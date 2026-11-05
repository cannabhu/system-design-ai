import type { ErrorEvent } from "@sentry/nextjs";

const isProduction =
  (process.env.VERCEL_ENV ?? process.env.NODE_ENV) === "production";

// Known harmless browser noise.
const IGNORED_ERRORS = [
  "ResizeObserver loop limit exceeded",
  "ResizeObserver loop completed with undelivered notifications",
];

// Request bodies and cookies can hold prompts, chat, canvas or spec content.
function stripSensitiveRequestData(event: ErrorEvent): ErrorEvent {
  if (event.request) {
    delete event.request.data;
    delete event.request.cookies;
    if (event.request.headers) {
      delete event.request.headers.cookie;
      delete event.request.headers.Cookie;
    }
  }
  return event;
}

export function getSentryOptions(dsn: string | undefined) {
  return {
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    enabled: Boolean(dsn),
    tracesSampleRate: isProduction ? 0.1 : 0.2,
    sendDefaultPii: false,
    ignoreErrors: IGNORED_ERRORS,
    beforeSend: stripSensitiveRequestData,
  };
}
