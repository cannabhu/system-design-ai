import { ImageResponse } from "next/og";
import { THEME_COLOR, siteConfig } from "@/lib/site";

export const ogSize = { width: 1200, height: 630 };
export const ogAlt = `${siteConfig.name} - ${siteConfig.tagline}`;

// Shared renderer for opengraph-image and twitter-image. No network fetches:
// the default ImageResponse font is bundled and there are no external images.
export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: THEME_COLOR,
          color: "#f4f4f5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 128,
              height: 128,
              borderRadius: 32,
              background: "#6457f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="76"
              height="76"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" />
              <path d="M20 2v4" />
              <path d="M22 4h-4" />
              <circle cx="4" cy="20" r="2" />
            </svg>
          </div>
          <div
            style={{
              marginLeft: 36,
              fontSize: 104,
              fontWeight: 700,
              letterSpacing: -2,
            }}
          >
            {siteConfig.name}
          </div>
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 42,
            color: "#a1a1aa",
          }}
        >
          {siteConfig.tagline}
        </div>
      </div>
    ),
    { ...ogSize },
  );
}
