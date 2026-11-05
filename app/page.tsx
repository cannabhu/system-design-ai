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

const title = "Grand AI | AI-powered system design workspace";
const description =
  "Describe a system, refine it with your team on a shared canvas, and generate the architecture and spec with Grand AI.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    siteName: "Grand AI",
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
    </div>
  );
}
