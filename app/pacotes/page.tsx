import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";

import { Section } from "@/components/layout/section";
import { PackageHighlightOnLoad } from "@/components/packages/package-highlight-on-load";
import { PackagesPageContent } from "@/components/sections/packages/packages-page-content";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Button } from "@/components/ui/button";
import { packagesPageContent } from "@/config/packages-page";
import { getPackagesPageData } from "@/lib/package/queries";
import { createMetadata } from "@/lib/seo";
import { scrollRevealDefaults } from "@/lib/motion";

export const metadata: Metadata = createMetadata({
  title: "Pacotes Turísticos",
  description: packagesPageContent.subtitle,
  path: "/pacotes",
  keywords: [
    "pacotes turísticos",
    "passagens aéreas",
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
      <div className="mb-6 sm:mb-8">
        <Button
          asChild
          variant="ghost"
          className="h-9 rounded-lg px-3 text-sm text-muted-foreground hover:text-foreground"
        >
          <Link href="/">
            <ArrowLeft className="size-4" aria-hidden />
            Voltar para a página inicial
          </Link>
        </Button>
      </div>

      <ScrollReveal y={scrollRevealDefaults.y}>
        <header className="mx-auto mb-10 max-w-3xl space-y-3 text-center sm:mb-12 lg:mb-14">
        <h1
          id="pacotes-page-heading"
          className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-[2.5rem] md:leading-tight"
        >
          {packagesPageContent.title}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg">
          {packagesPageContent.subtitle}
        </p>
      </header>
      </ScrollReveal>

      <Suspense fallback={null}>
        <PackageHighlightOnLoad />
      </Suspense>

      <PackagesPageContent data={data} />
    </Section>
  );
}
