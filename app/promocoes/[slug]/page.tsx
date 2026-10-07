import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { Section } from "@/components/layout/section";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { PackagesListingSection } from "@/components/sections/packages/packages-listing-section";
import { packagesPageContent, packagesPageSections } from "@/config/packages-page";
import { scrollRevealDefaults } from "@/lib/motion";
import { PACKAGE_SCHEDULE_TIME_ZONE } from "@/lib/package/dates";
import { getPromotionPageData } from "@/lib/promotion/queries";
import { createMetadata, createNoIndexMetadata, noIndexRobots } from "@/lib/seo";

type PromocaoPageProps = {
  params: Promise<{ slug: string }>;
};

// Curto: a página some (vai pra /pacotes) logo depois do fim da promoção.
export const revalidate = 60;

// Lista vazia = nada no build, cada promoção é gerada na primeira visita (ISR).
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PromocaoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const promotion = await getPromotionPageData(slug);

  if (!promotion) {
    return createNoIndexMetadata({ title: "Promoção encerrada" });
  }

  return createMetadata({
    title: promotion.name,
    description: `${promotion.name}: pacotes e passagens em oferta na Cris das Passagens.`,
    path: `/promocoes/${promotion.slug}`,
    // Fora do Google: a página é de campanha e sai do ar no fim do período.
    robots: noIndexRobots,
    ogImage: { url: promotion.image, alt: promotion.name, width: 1080, height: 1350 },
  });
}

const endsAtFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: PACKAGE_SCHEDULE_TIME_ZONE,
});

export default async function PromocaoPage({ params }: PromocaoPageProps) {
  const { slug } = await params;
  const promotion = await getPromotionPageData(slug);

  if (!promotion) {
    redirect("/pacotes");
  }

  const sections = packagesPageSections
    .map((config) => ({
      config,
      packages: promotion.packages.filter((pkg) => pkg.type === config.type),
    }))
    .filter((section) => section.packages.length > 0);

  return (
    <Section spacing="page" background="default" bordered aria-labelledby="promocao-heading">
      <PageBreadcrumb
        items={[
          { name: "Início", path: "/" },
          { name: "Pacotes", path: "/pacotes" },
          { name: promotion.name, path: `/promocoes/${promotion.slug}` },
        ]}
      />

      <ScrollReveal y={scrollRevealDefaults.y}>
        <header className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
          <h1
            id="promocao-heading"
            className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-[2.5rem] md:leading-tight"
          >
            {promotion.name}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Válida até {endsAtFormatter.format(new Date(promotion.endsAt)).replace(", ", " às ")}
          </p>
        </header>
      </ScrollReveal>

      {sections.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-12 text-center text-sm text-muted-foreground sm:text-base">
          {packagesPageContent.emptySectionMessage}
        </p>
      ) : (
        <div className="space-y-11 sm:space-y-12 lg:space-y-14">
          {sections.map(({ config, packages }, index) => (
            <PackagesListingSection
              key={config.sectionId}
              config={config}
              packages={packages}
              className={
                index > 0 ? "border-t border-border/50 pt-11 sm:pt-12 lg:pt-14" : undefined
              }
            />
          ))}
        </div>
      )}
    </Section>
  );
}
