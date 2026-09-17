import type { Metadata } from "next";

import { ItineraryCard } from "@/components/itineraries/itinerary-card";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { Section } from "@/components/layout/section";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { CtaButton } from "@/components/ui/cta-button";
import { getItinerariesGroupedByCategory } from "@/lib/itinerary/queries";
import { getQuoteWhatsAppUrl } from "@/lib/coupon/whatsapp";
import { scrollRevealDefaults } from "@/lib/motion";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Roteiros de viagem",
  description:
    "Todos os roteiros da Cris das Passagens: viagens prontas com itinerário, hospedagem e saídas, organizadas por temporada e estilo.",
  path: "/roteiros",
  keywords: ["roteiros de viagem", "pacotes prontos", "viagens nacionais", "viagens internacionais", "Cris das Passagens"],
});

export const revalidate = 3600;

const breadcrumbs = [
  { name: "Início", path: "/" },
  { name: "Roteiros", path: "/roteiros" },
] as const;

export default async function RoteirosPage() {
  const categories = await getItinerariesGroupedByCategory();

  return (
    <Section spacing="page" background="default" bordered aria-labelledby="roteiros-page-heading">
      <PageBreadcrumb items={breadcrumbs} />

      <ScrollReveal y={scrollRevealDefaults.y}>
        <header className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
          <h1
            id="roteiros-page-heading"
            className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-[2.5rem] md:leading-tight"
          >
            Todos os roteiros
          </h1>
        </header>
      </ScrollReveal>

      {categories.length === 0 ? (
        <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-dashed border-border/70 p-8 text-center">
          <p className="text-muted-foreground">
            Os roteiros estão sendo preparados. Enquanto isso, a gente monta o seu no WhatsApp.
          </p>
          <div className="flex justify-center">
            <CtaButton href={getQuoteWhatsAppUrl()} label="Montar meu roteiro" trackingSource="content_cta" />
          </div>
        </div>
      ) : (
        <div className="space-y-12 sm:space-y-14">
          {categories.map((category, categoryIndex) => (
            <section key={category.id} id={category.slug} aria-labelledby={`categoria-${category.slug}`}>
              <ScrollReveal>
                <h2
                  id={`categoria-${category.slug}`}
                  className="mb-5 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
                >
                  {category.name}
                </h2>
              </ScrollReveal>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                {category.itineraries.map((itinerary, index) => (
                  <ScrollReveal key={itinerary.id} delay={index * scrollRevealDefaults.stagger}>
                    <ItineraryCard itinerary={itinerary} priority={categoryIndex === 0 && index < 3} />
                  </ScrollReveal>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </Section>
  );
}
