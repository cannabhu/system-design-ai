import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Env values may be a path ("/sign-in") or a full URL; keep only the pathname.
const toPathname = (url: string | undefined, fallback: string) => {
  if (!url) return fallback;
  try {
    return new URL(url, "http://localhost").pathname.replace(/\/+$/, "") || fallback;
  } catch {
    return fallback;
  }
};

const isPublicRoute = createRouteMatcher([
  `${toPathname(process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL, "/sign-in")}(.*)`,
  `${toPathname(process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL, "/sign-up")}(.*)`,
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for Clerk's auto-proxy path
    "/__clerk/:path*",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
