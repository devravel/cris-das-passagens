import type { Metadata } from "next";
import { Suspense } from "react";

import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { Section } from "@/components/layout/section";
import { brandPageBreadcrumbs } from "@/config/navigation";
import { PackageHighlightOnLoad } from "@/components/packages/package-highlight-on-load";
import { PackagesPageContent } from "@/components/sections/packages/packages-page-content";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { packagesPageContent } from "@/config/packages-page";
import { findPackageBySlug } from "@/lib/package/highlight";
import { getPackageHighlightPath, getPackageOgImageUrl } from "@/lib/package/routes";
import { getPackagesPageData } from "@/lib/package/queries";
import { createMetadata } from "@/lib/seo";
import { scrollRevealDefaults } from "@/lib/motion";

const packagesPageKeywords = [
  "pacotes turísticos",
  "passagens aéreas",
  "circuitos",
  "hospedagem",
  "ingressos",
  "cruzeiros",
  "viagens nacionais",
  "viagens internacionais",
  "Cris das Passagens",
] as const;

type PacotesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getHighlightSlug(
  searchParams: Record<string, string | string[] | undefined>,
): string | null {
  const value = searchParams.destaque;

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return null;
}

export async function generateMetadata({
  searchParams,
}: PacotesPageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const highlightSlug = getHighlightSlug(resolvedSearchParams);

  if (highlightSlug) {
    const data = await getPackagesPageData();
    const highlightedPackage = findPackageBySlug(data, highlightSlug);

    if (highlightedPackage) {
      const description =
        highlightedPackage.shortDescription?.trim() ||
        highlightedPackage.destination;

      return createMetadata({
        title: highlightedPackage.title,
        description,
        path: getPackageHighlightPath(highlightedPackage.slug),
        ogImage: {
          url: getPackageOgImageUrl(highlightedPackage.slug),
          alt: highlightedPackage.title,
          width: 1200,
          height: 630,
        },
        keywords: [
          highlightedPackage.title,
          highlightedPackage.destination,
          ...packagesPageKeywords,
        ],
      });
    }
  }

  return createMetadata({
    title: "Pacotes Turísticos",
    description: packagesPageContent.description,
    path: "/pacotes",
    keywords: [...packagesPageKeywords],
  });
}

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
