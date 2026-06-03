"use client";

import { cn } from "@/lib/utils";

export type CarouselDotsProps = {
  /** Número total de páginas/slides */
  pageCount: number;
  /** Índice da página ativa (0-indexed) */
  activeIndex: number;
  /** Callback para seleção de página */
  onSelect: (index: number) => void;
  /** Rótulo de acessibilidade para o grupo de dots */
  ariaLabel?: string;
  /** Se há múltiplas páginas (habilita interação) */
  hasMultiple?: boolean;
  /** Classes CSS adicionais */
  className?: string;
  /** Função para gerar rótulo específico de cada dot */
  getItemLabel?: (index: number, total: number) => string;
};

/**
 * Componente reutilizável para dots de navegação de carrossel.
 * Baseado no modelo da seção "Nossos Parceiros".
 */
export function CarouselDots({
  pageCount,
  activeIndex,
  onSelect,
  ariaLabel = "Navegação do carrossel",
  hasMultiple = pageCount > 1,
  className,
  getItemLabel,
}: CarouselDotsProps) {
  if (pageCount <= 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2",
        className,
      )}
      role="tablist"
      aria-label={ariaLabel}
    >
      {Array.from({ length: pageCount }, (_, index) => {
        const isActive = index === activeIndex;
        
        const defaultLabel = `Ver página ${index + 1} de ${pageCount}`;
        const itemLabel = getItemLabel ? getItemLabel(index, pageCount) : defaultLabel;

        return (
          <button
            key={index}
            type="button"
            role="tab"
            disabled={!hasMultiple}
            aria-selected={isActive}
            aria-disabled={!hasMultiple}
            aria-label={itemLabel}
            className={cn(
              "h-2 rounded-full transition-all duration-300 motion-reduce:transition-none",
              isActive ? "w-7 bg-brand" : "w-2 bg-border",
              hasMultiple
                ? "hover:bg-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                : "cursor-default opacity-70",
            )}
            onClick={() => {
              if (hasMultiple) {
                onSelect(index);
              }
            }}
          />
        );
      })}
    </div>
  );
}