import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

import { BlogPreviewHomeSection } from "@/components/sections/blog/blog-preview-home-section";
import { FaqModern } from "@/components/sections/faq/faq-modern";
import { HomeHero } from "@/components/sections/hero/home-hero";
import { HomeHeroSkeleton } from "@/components/sections/hero/home-hero-skeleton";
import { HomePackagesSections } from "@/components/sections/packages/home-packages-sections";
import { HomePackagesSectionsSkeleton } from "@/components/sections/packages/home-packages-sections-skeleton";
import { SupportSection } from "@/components/sections/about/about-support";
import { TestimonialsModernLazy } from "@/components/sections/testimonials/testimonials-modern-lazy";
import { content } from "@/config/content";
import { LANDING_PACKAGE_CATEGORY_SECTIONS_ENABLED } from "@/config/packages-showcase";
import { siteConfig } from "@/config/site";
import { createMetadata } from "@/lib/seo";

const CadasturCompactSection = dynamic(
  () =>
    import("@/components/sections/trust/cadastur-compact-section").then(
      (module) => module.CadasturCompactSection,
    ),
);

const PartnersSection = dynamic(
  () =>
    import("@/components/sections/trust/partners-section").then(
      (module) => module.PartnersSection,
    ),
);

const FinalCta = dynamic(
  () =>
    import("@/components/sections/cta/final-cta").then((module) => module.FinalCta),
);

const NewsletterSection = dynamic(
  () =>
    import("@/components/newsletter/newsletter-section").then(
      (module) => module.NewsletterSection,
    ),
);

export const metadata: Metadata = createMetadata({
  title: siteConfig.name,
  absoluteTitle: true,
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
      {/* Seções de categorias de pacotes desabilitadas temporariamente na Landing Page. Reativar quando necessário. */}
      {LANDING_PACKAGE_CATEGORY_SECTIONS_ENABLED ? (
        <Suspense fallback={<HomePackagesSectionsSkeleton />}>
          <HomePackagesSections />
        </Suspense>
      ) : null}
      <CadasturCompactSection />
      <TestimonialsModernLazy />
      <SupportSection />
      <FaqModern />
      <BlogPreviewHomeSection />
      <PartnersSection />
      {content.finalCta.enabled ? (
        <FinalCta className="pt-0 pb-12 sm:pb-14 lg:pb-16" spacing="compact" />
      ) : null}
      <NewsletterSection />
    </>
  );
}
