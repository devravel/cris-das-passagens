import type { Metadata } from "next";
import { Suspense } from "react";

import { BlogPreviewHomeSection } from "@/components/sections/blog/blog-preview-home-section";
import { FinalCta } from "@/components/sections/cta/final-cta";
import { FaqModern } from "@/components/sections/faq/faq-modern";
import { HomeHero } from "@/components/sections/hero/home-hero";
import { HomeHeroSkeleton } from "@/components/sections/hero/home-hero-skeleton";
import { HomePackagesSections } from "@/components/sections/packages/home-packages-sections";
import { HomePackagesSectionsSkeleton } from "@/components/sections/packages/home-packages-sections-skeleton";
import { SupportSection } from "@/components/sections/about/about-support";
import { TestimonialsModern } from "@/components/sections/testimonials/testimonials-modern";
import { CadasturCompactSection } from "@/components/sections/trust/cadastur-compact-section";
import { PartnersSection } from "@/components/sections/trust/partners-section";
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
      <Suspense fallback={<HomeHeroSkeleton />}>
        <HomeHero />
      </Suspense>
      <Suspense fallback={<HomePackagesSectionsSkeleton />}>
        <HomePackagesSections />
      </Suspense>
      <CadasturCompactSection />
      <TestimonialsModern />
      <SupportSection />
      <FaqModern />
      <BlogPreviewHomeSection />
      <PartnersSection />
      <FinalCta className="pt-0 pb-12 sm:pb-14 lg:pb-16" spacing="compact" />
    </>
  );
}
