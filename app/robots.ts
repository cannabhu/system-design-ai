import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/editor", "/api/", "/sentry-example-page", "/monitoring"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
