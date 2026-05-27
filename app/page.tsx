import type { Metadata } from "next";
import { Suspense } from "react";

import {
  AboutSection,
  SupportSection,
} from "@/components/sections/about/about-support";
import { BlogPreviewHomeSection } from "@/components/sections/blog/blog-preview-home-section";
import { FinalCta } from "@/components/sections/cta/final-cta";
import { FaqModern } from "@/components/sections/faq/faq-modern";
import { TourismHero } from "@/components/sections/hero/tourism-hero";
// import { ProcessSteps } from "@/components/sections/process/process-steps";
import { HomePackagesSections } from "@/components/sections/packages/home-packages-sections";
import { HomePackagesSectionsSkeleton } from "@/components/sections/packages/home-packages-sections-skeleton";
import { QuickActions } from "@/components/sections/quick-actions/quick-actions";
import { TestimonialsModern } from "@/components/sections/testimonials/testimonials-modern";
import { SocialProofCadastur } from "@/components/sections/trust/social-proof-cadastur";
import { content } from "@/config/content";
import { siteConfig } from "@/config/site";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: siteConfig.name,
  description: content.meta.tagline,
  path: "/",
  keywords: [
    "passagens aereas",
    "pacotes de viagem",
    "agencia de turismo",
    "Cris das Passagens",
    "viagens nacionais",
    "viagens internacionais",
  ],
});

export const revalidate = 3600;

export default function HomePage() {
  return (
    <>
      <TourismHero />
      <Suspense fallback={<HomePackagesSectionsSkeleton />}>
        <HomePackagesSections />
      </Suspense>
      <QuickActions />
      <AboutSection />
      <SocialProofCadastur />
      <TestimonialsModern />
      <SupportSection />
      {/* <ProcessSteps /> — seção "Saiba como funciona" desativada temporariamente */}
      <FaqModern />
      <BlogPreviewHomeSection />
      <FinalCta />
    </>
  );
}
