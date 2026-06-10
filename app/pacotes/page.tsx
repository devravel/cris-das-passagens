import type { Metadata } from "next";
import { Suspense } from "react";

import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { Section } from "@/components/layout/section";
import { brandPageBreadcrumbs } from "@/config/navigation";
import { PackageHighlightOnLoad } from "@/components/packages/package-highlight-on-load";
import { PackagesPageContent } from "@/components/sections/packages/packages-page-content";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { packagesPageContent } from "@/config/packages-page";
import { getPackagesPageData } from "@/lib/package/queries";
import { createMetadata } from "@/lib/seo";
import { scrollRevealDefaults } from "@/lib/motion";

export const metadata: Metadata = createMetadata({
  title: "Pacotes Turísticos",
  description: packagesPageContent.description,
  path: "/pacotes",
  keywords: [
    "pacotes turísticos",
    "passagens aéreas",
    "circuitos",
    "hospedagem",
    "ingressos",
    "cruzeiros",
    "viagens nacionais",
    "viagens internacionais",
    "Cris das Passagens",
  ],
});

export const revalidate = 3600;

export default async function PacotesPage() {
  const data = await getPackagesPageData();

  return (
    <Section
      spacing="page"
      background="default"
      bordered
      aria-labelledby="pacotes-page-heading"
    >
      <PageBreadcrumb items={brandPageBreadcrumbs.pacotes} />

      <ScrollReveal y={scrollRevealDefaults.y}>
        <header className="mx-auto mb-6 max-w-3xl text-center sm:mb-7 lg:mb-8">
          <h1
            id="pacotes-page-heading"
            className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-[2.5rem] md:leading-tight"
          >
            {packagesPageContent.title}
          </h1>
        </header>
      </ScrollReveal>

      <Suspense fallback={null}>
        <PackageHighlightOnLoad />
      </Suspense>

      <PackagesPageContent data={data} />
    </Section>
  );
}
