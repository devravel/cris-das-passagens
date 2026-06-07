"use client";

import Script from "next/script";

import { useConsent } from "@/components/consent/consent-context";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { TestimonialsStaticFallback } from "@/components/sections/testimonials/testimonials-static-fallback";
import { content } from "@/config/content";
import { HOME_TESTIMONIALS_SECTION_ID } from "@/config/navigation";

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
        <>
          <Script src="https://elfsightcdn.com/platform.js" strategy="afterInteractive" />
          <div className="w-full">
            <div
              className="elfsight-app-3fd6553a-00c3-4848-823e-0f569bbdebff"
              data-elfsight-app-lazy
            />
          </div>
        </>
      ) : (
        <TestimonialsStaticFallback items={content.testimonials.items} />
      )}
    </Section>
  );
}
