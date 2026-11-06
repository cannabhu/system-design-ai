import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SentryUser } from "@/components/sentry-user";
import { Analytics } from "@vercel/analytics/next"
import { THEME_COLOR, siteConfig } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "system design",
    "architecture diagram",
    "AI architecture",
    "real-time collaboration",
    "software design tool",
    "technical spec generator",
  ],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider
          appearance={{
            theme: dark,
            variables: {
              colorBackground: "var(--bg-surface)",
              colorInput: "var(--bg-base)",
              colorForeground: "var(--text-primary)",
              colorMutedForeground: "var(--text-muted)",
              colorInputForeground: "var(--text-primary)",
              colorPrimary: "var(--accent-primary)",
              colorPrimaryForeground: "var(--bg-base)",
              colorNeutral: "var(--text-primary)",
              colorDanger: "var(--state-error)",
              colorSuccess: "var(--state-success)",
              colorWarning: "var(--state-warning)",
              colorBorder: "var(--border-default)",
              colorRing: "var(--accent-primary)",
              colorShadow: "transparent",
              fontFamily: "var(--font-geist-sans), sans-serif",
              fontFamilyButtons: "var(--font-geist-sans), sans-serif",
              fontFamilyMono: "var(--font-geist-mono), monospace",
              borderRadius: "var(--radius)",
            },
          }}
        >
          <Suspense fallback={null}>
            <SentryUser />
          </Suspense>
          
          {children}
          <Analytics />
        </ClerkProvider>
      </body>
    </html>
  );
}
