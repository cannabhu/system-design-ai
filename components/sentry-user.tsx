"use client";

import { useUser } from "@clerk/nextjs";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

// Attaches the Clerk user ID (no email or name) to Sentry events.
export function SentryUser() {
  const { isLoaded, user } = useUser();
  const userId = user?.id;

  useEffect(() => {
    if (!isLoaded) return;
    Sentry.setUser(userId ? { id: userId } : null);
  }, [isLoaded, userId]);

  return null;
}
