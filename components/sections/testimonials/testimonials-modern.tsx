"use client";

import dynamic from "next/dynamic";

import { useConsent } from "@/components/consent/consent-context";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { TestimonialsElfsightHost } from "@/components/sections/testimonials/testimonials-elfsight-host";
import { content } from "@/config/content";
import { HOME_TESTIMONIALS_SECTION_ID } from "@/config/navigation";

const GoogleReviewsFallback = dynamic(
  () =>
    import("@/components/sections/testimonials/google-reviews/google-reviews-fallback").then(
      (module) => module.GoogleReviewsFallback,
    ),
  { ssr: false },
);

export type TestimonialsModernProps = {
  sectionId?: string;
  title?: string;
  subtitle?: string;
  className?: string;
};

export function TestimonialsModern({
  sectionId = HOME_TESTIMONIALS_SECTION_ID,
  title = content.testimonials.title,
  subtitle = content.testimonials.subtitle,
  className,
}: TestimonialsModernProps) {
  const headingId = `${sectionId}-heading`;
  const { isReady, isCategoryEnabled } = useConsent();
  const analyticsEnabled = isReady && isCategoryEnabled("analytics");

  return (
    <Section
      id={sectionId}
      background="soft"
      spacing="default"
      bordered
      className={className}
      aria-labelledby={headingId}
    >
      <SectionHeader
        id={headingId}
        title={title}
        subtitle={subtitle}
        subtitleClassName="mt-4"
        className="mb-12 sm:mb-14 lg:mb-16"
      />

      {analyticsEnabled ? (
        <TestimonialsElfsightHost />
      ) : (
        <GoogleReviewsFallback />
      )}
    </Section>
  );
}
