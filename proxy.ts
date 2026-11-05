import { clerkMiddleware } from "@clerk/nextjs/server";

// Only makes Clerk's auth() available. Access control is resource-level:
// /editor layout + pages redirect, API routes return 401.
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals, the Sentry tunnel (/monitoring) and all static files, unless found in search params
    "/((?!_next|monitoring(?:/|$)|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for Clerk's auto-proxy path
    "/__clerk/:path*",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
