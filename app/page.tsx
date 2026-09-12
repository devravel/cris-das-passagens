import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Suspense } from "react";

import { BlogPreviewHomeSection } from "@/components/sections/blog/blog-preview-home-section";
import { FaqModern } from "@/components/sections/faq/faq-modern";
import { TourismHero } from "@/components/sections/hero/tourism-hero";
import { InstagramSection } from "@/components/sections/instagram/instagram-section";
import { ItinerariesSection } from "@/components/sections/itineraries/itineraries-section";
import { FeaturedPackagesSection } from "@/components/sections/packages/featured-packages-section";
import { FeaturedPackagesSkeleton } from "@/components/sections/packages/featured-packages-skeleton";
import { HomePackagesSections } from "@/components/sections/packages/home-packages-sections";
import { HomePackagesSectionsSkeleton } from "@/components/sections/packages/home-packages-sections-skeleton";
import { SupportSection } from "@/components/sections/about/about-support";
import { TestimonialsModernLazy } from "@/components/sections/testimonials/testimonials-modern-lazy";
import { content } from "@/config/content";
import { LANDING_PACKAGE_CATEGORY_SECTIONS_ENABLED } from "@/config/packages-showcase";
import { getHomeHeroPrimaryCta } from "@/config/rei-da-copa-campaign";
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
      <TourismHero primaryCta={getHomeHeroPrimaryCta(content.hero.primaryCta)} />
      <Suspense fallback={<FeaturedPackagesSkeleton />}>
        <FeaturedPackagesSection />
      </Suspense>
      {content.itineraries.enabled ? <ItinerariesSection /> : null}
      {/* Seções por categoria de pacote: desligadas, a home mostra só os destaques. */}
      {LANDING_PACKAGE_CATEGORY_SECTIONS_ENABLED ? (
        <Suspense fallback={<HomePackagesSectionsSkeleton />}>
          <HomePackagesSections />
        </Suspense>
      ) : null}
      <CadasturCompactSection />
      <TestimonialsModernLazy />
      <InstagramSection />
      <SupportSection className="bg-muted/25" />
      <BlogPreviewHomeSection />
      <FaqModern />
      <PartnersSection />
      {content.finalCta.enabled ? (
        <FinalCta className="pt-0 pb-12 sm:pb-14 lg:pb-16" spacing="compact" />
      ) : null}
      <NewsletterSection />
    </>
  );
}
