import type { Metadata } from "next";
import { Suspense, cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { AboutSection } from "@/components/landing/about-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection } from "@/components/landing/hero-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { ReviewsSection } from "@/components/landing/reviews-section";
import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/lib/site";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/icon-512.png`,
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description: siteConfig.description,
    url: siteConfig.url,
  },
];

export const metadata: Metadata = {
  title: { absolute: siteConfig.title },
  description: siteConfig.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    type: "website",
    siteName: siteConfig.name,
    url: "/",
  },
};

// One auth lookup per request, shared by the navbar and the FAQ call-to-action.
const getSignedIn = cache(async () => Boolean((await auth()).userId));

async function AuthNavbar() {
  return <LandingNavbar signedIn={await getSignedIn()} />;
}

async function AuthFaq() {
  return <FaqSection signedIn={await getSignedIn()} />;
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-base text-copy-primary">
      <Suspense fallback={<LandingNavbar />}>
        <AuthNavbar />
      </Suspense>
      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <FeaturesSection />
        <ReviewsSection />
        <Suspense fallback={<FaqSection />}>
          <AuthFaq />
        </Suspense>
      </main>
      <LandingFooter />
      {structuredData.map((data) => (
        <JsonLd key={data["@type"]} data={data} />
      ))}
    </div>
  );
}
