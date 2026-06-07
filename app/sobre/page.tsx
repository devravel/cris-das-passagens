import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { brandPageBreadcrumbs } from "@/config/navigation";
import { Section } from "@/components/layout/section";
import {
  bodyTextClassName,
  SectionHeader,
} from "@/components/layout/section-header";
import { ContentCtaButton } from "@/components/ui/content-cta-button";
import { content } from "@/config/content";
import { createMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = createMetadata({
  title: content.about.title,
  description: content.about.description,
  path: "/sobre",
  keywords: [
    "Cris das Passagens",
    "agência de viagens",
    "passagens aéreas",
    "milhas aéreas",
    "turismo",
  ],
});

export default function SobrePage() {
  const { title, storyTitle, paragraphs, closing, cta } = content.about;

  return (
    <Section
      spacing="page"
      background="default"
      bordered
      aria-labelledby="sobre-page-heading"
    >
      <PageBreadcrumb items={brandPageBreadcrumbs.sobre} />

      <SectionHeader
        id="sobre-page-heading"
        title={title}
        className="mb-10 sm:mb-12"
      />

      <Container size="narrow" padding="none">
        <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {storyTitle}
        </h2>

        <div className="mt-6 space-y-4 sm:mt-8">
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className={bodyTextClassName}>
              {paragraph}
            </p>
          ))}

          {closing ? (
            <p
              className={cn(
                "pt-2 font-medium text-foreground",
                bodyTextClassName,
              )}
            >
              {closing}
            </p>
          ) : null}
        </div>

        <div className="mt-8 flex justify-center sm:mt-10">
          <ContentCtaButton cta={cta} />
        </div>
      </Container>
    </Section>
  );
}
