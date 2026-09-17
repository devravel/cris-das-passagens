import type { Metadata } from "next";

import { ItineraryBanner } from "@/components/itineraries/itinerary-banner";
import { ItineraryCard } from "@/components/itineraries/itinerary-card";
import { Container } from "@/components/layout/container";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { CtaButton } from "@/components/ui/cta-button";
import { getItinerariesGroupedByCategory } from "@/lib/itinerary/queries";
import { getQuoteWhatsAppUrl } from "@/lib/coupon/whatsapp";
import { scrollRevealDefaults } from "@/lib/motion";
import { createMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

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

/** Foto da faixa de topo — a mesma dos cards de serviço da hero. */
const BANNER_IMAGE = "/hero/servicos/pacotes.webp";

export default async function RoteirosPage() {
  const categories = await getItinerariesGroupedByCategory();
  const hasOverlap = categories.length > 0;

  return (
    <>
      <PageBreadcrumb items={breadcrumbs} />
      {/* Faixa mais alta, com o padding de baixo reservado: a primeira divisória sobe e "invade" a foto (referência). */}
      <ItineraryBanner
        title="Todos os roteiros"
        image={BANNER_IMAGE}
        priority
        centered
        className={cn("min-h-72 sm:min-h-96 lg:min-h-[30rem]", hasOverlap && "pb-28 sm:pb-36")}
      />

      <Container className={cn("pb-8 sm:pb-10", hasOverlap ? "relative z-10 -mt-24 sm:-mt-32" : "pt-8 sm:pt-10")}>
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
          <div className="space-y-10 sm:space-y-12">
            {categories.map((category, categoryIndex) => (
              <section key={category.id} id={category.slug} aria-labelledby={`categoria-${category.slug}`}>
                <ScrollReveal>
                  <h2
                    id={`categoria-${category.slug}`}
                    className={cn(
                      "mb-4 flex items-center gap-3 font-heading text-2xl font-bold uppercase tracking-tight before:h-7 before:w-1.5 before:rounded-full sm:text-[1.65rem]",
                      // A primeira divisória fica em cima da foto do banner.
                      categoryIndex === 0 ? "text-white drop-shadow before:bg-brand-cyan" : "text-foreground before:bg-brand",
                    )}
                  >
                    {category.name}
                  </h2>
                </ScrollReveal>
                {/* Card sempre do tamanho do desktop (~16rem); em tela menor só empilha, não cresce. */}
                <div className="grid grid-cols-[repeat(auto-fill,16rem)] justify-center gap-4 sm:justify-start">
                  {category.itineraries.map((itinerary, index) => (
                    <ScrollReveal key={itinerary.id} delay={index * scrollRevealDefaults.stagger}>
                      <ItineraryCard itinerary={itinerary} priority={categoryIndex === 0 && index < 4} />
                    </ScrollReveal>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
