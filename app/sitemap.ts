import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

// Only the landing page is listed. /sign-in and /sign-up are intentionally
// omitted (they are noindex and not meant to be discovered via search).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
