"use client";

import { PackageCardsCarouselAutoplay } from "@/components/packages/package-cards-carousel-autoplay";
import { PackageCardsCarouselAutoplayDesktop } from "@/components/packages/package-cards-carousel-autoplay-desktop";
import type { PublicPackage } from "@/lib/package/queries";
import { cn } from "@/lib/utils";

type PackageCardsCarouselWithAutoplayProps = {
  packages: PublicPackage[];
  departureCity: string;
  ariaLabel: string;
  className?: string;
  variant?: "landing" | "listing";
  showChecklist?: boolean;
  cardClassName?: string;
  /** Exibe dots de navegação abaixo do carrossel mobile (padrão: true). */
  showDots?: boolean;
  /** Exibe o hint do carrossel em todos os breakpoints mobile (padrão: só quando há overflow). */
  scrollHintAlwaysVisible?: boolean;
};

/**
 * Carousel de pacotes com autoplay contínuo baseado na mesma lógica da seção de parceiros.
 * Funciona em mobile (com dots e scroll hint) e desktop (sempre autoplay quando necessário).
 * Velocidade 2.5x mais lenta que os parceiros para leitura confortável dos cards.
 */
export function PackageCardsCarouselWithAutoplay({
  packages,
  departureCity,
  ariaLabel,
  className,
  variant = "landing",
  showChecklist = false,
  cardClassName,
  showDots = true,
  scrollHintAlwaysVisible = false,
}: PackageCardsCarouselWithAutoplayProps) {
  if (packages.length === 0) {
    return null;
  }

  return (
    <div className={cn("relative min-w-0", className)}>
      {/* Mobile e tablet - com dots e scroll hint */}
      <PackageCardsCarouselAutoplay
        packages={packages}
        departureCity={departureCity}
        ariaLabel={ariaLabel}
        variant={variant}
        showChecklist={showChecklist}
        cardClassName={cardClassName}
        showDots={showDots}
        scrollHintAlwaysVisible={scrollHintAlwaysVisible}
      />

      {/* Desktop - sem dots, só autoplay quando necessário */}
      <PackageCardsCarouselAutoplayDesktop
        packages={packages}
        departureCity={departureCity}
        variant={variant}
        showChecklist={showChecklist}
        cardClassName={cardClassName}
      />
    </div>
  );
}