const devFallback = "http://localhost:3000";

function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/+$/, "");
  // Fallback is for local development only; production must set the env var.
  return devFallback;
}

export const siteConfig = {
  name: "Grand AI",
  url: resolveSiteUrl(),
  title: "Grand AI | AI-powered system design workspace",
  tagline: "AI-powered system design workspace",
  description:
    "Describe a system, refine it with your team on a shared canvas, and generate the architecture and spec with Grand AI.",
  ogImage: "/opengraph-image",
} as const;

// Matches --bg-base in app/globals.css.
export const THEME_COLOR = "#080809";
