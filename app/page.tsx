import type { Metadata } from "next";

import { AboutSection, SupportSection } from "@/components/sections/about/about-support";
import { BlogPreviewSection } from "@/components/sections/blog/blog-preview-section";
import { FinalCta } from "@/components/sections/cta/final-cta";
import { FaqModern } from "@/components/sections/faq/faq-modern";
import { TourismHero } from "@/components/sections/hero/tourism-hero";
import { ProcessSteps } from "@/components/sections/process/process-steps";
import { QuickActions } from "@/components/sections/quick-actions/quick-actions";
import { TestimonialsModern } from "@/components/sections/testimonials/testimonials-modern";
import { SocialProofCadastur } from "@/components/sections/trust/social-proof-cadastur";
import { content } from "@/config/content";
import { siteConfig } from "@/config/site";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: siteConfig.name,
  description: content.meta.tagline,
});

export default function HomePage() {
  return (
    <>
      <TourismHero />
      <QuickActions />
      <AboutSection />
      <SupportSection />
      <ProcessSteps />
      <SocialProofCadastur />
      <TestimonialsModern />
      <FaqModern />
      <BlogPreviewSection />
      <FinalCta />
    </>
  );
}
