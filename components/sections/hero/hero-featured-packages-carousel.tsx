"use client";

import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { PackageCarouselScrollHint } from "@/components/packages/package-carousel-scroll-hint";
import { PublicPackageCard } from "@/components/packages/public-package-card";
import type { PublicPackage } from "@/lib/package/queries";
import { cn } from "@/lib/utils";

type HeroFeaturedPackagesCarouselProps = {
  packages: PublicPackage[];
  departureCity: string;
  className?: string;
};

const CARD_GAP_MOBILE = 12;
const CARD_GAP_DESKTOP = 14;
/** 3 cópias: a do meio é a "ativa". Cópias 0 e 2 são buffer para o loop. */
const LOOP_COPIES = 3;
/** Abaixo deste viewport, card tem largura fixa (não espreme 3 no track). */
const NARROW_VIEWPORT_PX = 600;
const NARROW_CARD_MAX_PX = 220;
const NARROW_CARD_VW_RATIO = 0.78;

const navButtonClassName =
  "group absolute top-1/2 z-10 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-background/95 text-muted-foreground shadow-md backdrop-blur-sm transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out hover:scale-[1.06] hover:border-brand/35 hover:bg-brand/5 hover:text-brand hover:shadow-[0_4px_14px_-6px_rgba(52,91,167,0.28)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-35 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100 sm:size-10";

const navIconClassName =
  "size-5 transition-colors duration-200 group-hover:text-brand motion-reduce:transition-none";

function getCardGap(): number {
  return window.innerWidth >= 640 ? CARD_GAP_DESKTOP : CARD_GAP_MOBILE;
}

function resolveCardWidth(trackWidth: number, gap: number): number {
  if (window.innerWidth <= NARROW_VIEWPORT_PX) {
    return Math.min(NARROW_CARD_MAX_PX, window.innerWidth * NARROW_CARD_VW_RATIO);
  }

  if (trackWidth <= 0) return 0;

  // 3 cards visíveis
  return Math.max(0, (trackWidth - gap * 2) / 3);
}

export function HeroFeaturedPackagesCarousel({
  packages,
  departureCity,
  className,
}: HeroFeaturedPackagesCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  // Referências aos primeiros cards de cada cópia para medir o tamanho de um segmento.
  const copyStartRefs = useRef<(HTMLDivElement | null)[]>([null, null, null]);

  const segmentRef = useRef(0);
  const cardWidthRef = useRef(0);
  const cardGapRef = useRef(CARD_GAP_MOBILE);
  const didInitRef = useRef(false);
  // Bloqueia normalizeLoop durante a animação smooth dos botões.
  const suppressNormalizeRef = useRef(false);
  const suppressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [cardWidth, setCardWidth] = useState(0);
  const [cardGap, setCardGap] = useState(CARD_GAP_MOBILE);

  const useInfinite = packages.length > 1;
  const copyCount = useInfinite ? LOOP_COPIES : 1;

  // ─── Normalização do loop ──────────────────────────────────────────────────
  // Mantém o scroll sempre dentro da cópia do meio (índice 1).
  // Faixa válida: [0.5 * segment, 2.5 * segment).
  const normalizeLoop = useCallback(() => {
    const track = trackRef.current;
    const segment = segmentRef.current;

    if (!track || !useInfinite || segment <= 0 || suppressNormalizeRef.current) return;

    const left = track.scrollLeft;

    if (left < segment * 0.5) {
      track.scrollLeft = left + segment;
    } else if (left >= segment * 2.5) {
      track.scrollLeft = left - segment;
    }
  }, [useInfinite]);

  // ─── Medição ───────────────────────────────────────────────────────────────
  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const gap = getCardGap();
    const width = resolveCardWidth(track.clientWidth, gap);

    cardGapRef.current = gap;
    cardWidthRef.current = width;
    setCardGap(gap);
    setCardWidth(width);

    if (!useInfinite || width <= 0) {
      segmentRef.current = 0;
      return;
    }

    // Mede o segmento depois do layout aplicar as larguras.
    requestAnimationFrame(() => {
      const [c0, c1] = copyStartRefs.current;
      if (!c0 || !c1) return;

      const segment = c1.offsetLeft - c0.offsetLeft;
      segmentRef.current = segment;

      if (!didInitRef.current && segment > 0) {
        didInitRef.current = true;
        // Inicia no começo da cópia do meio.
        track.scrollLeft = segment;
      }
    });
  }, [useInfinite]);

  useLayoutEffect(() => {
    didInitRef.current = false;
    measure();
  }, [measure, packages.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const ro = new ResizeObserver(() => {
      didInitRef.current = false;
      measure();
    });
    ro.observe(track);
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  // ─── Botões ────────────────────────────────────────────────────────────────
  const scrollByStep = useCallback((direction: -1 | 1) => {
    const track = trackRef.current;
    const width = cardWidthRef.current;
    const gap = cardGapRef.current;
    const segment = segmentRef.current;

    if (!track || width <= 0) return;

    // Garante posição na cópia do meio antes de iniciar a animação.
    if (useInfinite && segment > 0) {
      const left = track.scrollLeft;
      if (left < segment * 0.5) {
        track.scrollLeft = left + segment;
      } else if (left >= segment * 2.5) {
        track.scrollLeft = left - segment;
      }
    }

    // Suspende normalizeLoop pelo tempo da animação smooth (~500ms).
    suppressNormalizeRef.current = true;
    if (suppressTimerRef.current) clearTimeout(suppressTimerRef.current);
    suppressTimerRef.current = setTimeout(() => {
      suppressNormalizeRef.current = false;
      normalizeLoop();
    }, 600);

    track.scrollBy({ left: direction * (width + gap), behavior: "smooth" });
  }, [useInfinite, normalizeLoop]);

  if (packages.length === 0) return null;

  return (
    <div className={cn("relative min-w-0", className)}>
      <div className="relative min-w-0">
        <button
          type="button"
          className={cn(navButtonClassName, "left-1 sm:left-2")}
          onClick={() => scrollByStep(-1)}
          disabled={!useInfinite}
          aria-label="Ver pacote anterior"
        >
          <ChevronLeft className={navIconClassName} aria-hidden />
        </button>

        {/*
          touch-action: pan-x → browser trata arrasto horizontal como scroll do
          elemento (nativo, suave, com inércia); arrasto vertical propaga para a
          página. Nenhum handler de toque manual necessário.
        */}
        <div
          ref={trackRef}
          className="touch-pan-x min-w-0 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="region"
          aria-roledescription="carousel"
          aria-label="Pacotes em destaque"
          onScroll={normalizeLoop}
        >
          <div
            className={cn(
              "flex w-max items-stretch px-0.5 py-1",
              !useInfinite && "min-w-full justify-center",
            )}
            style={{ gap: `${cardGap}px` }}
          >
            {Array.from({ length: copyCount }, (_, copyIndex) => (
              <Fragment key={copyIndex}>
                {packages.map((pkg, pkgIndex) => (
                  <div
                    key={`${copyIndex}-${pkg.id}`}
                    ref={
                      pkgIndex === 0
                        ? (el) => {
                            copyStartRefs.current[copyIndex] = el;
                          }
                        : undefined
                    }
                    style={{ width: cardWidth > 0 ? `${cardWidth}px` : undefined }}
                    className={cn(
                      "flex shrink-0 items-stretch",
                      cardWidth === 0 && "invisible",
                    )}
                    // Cópias 0 e 2 são buffer de loop; apenas cópia 1 é "real".
                    aria-hidden={useInfinite && copyIndex !== 1}
                  >
                    <PublicPackageCard
                      pkg={pkg}
                      departureCity={departureCity}
                      layout="carousel"
                      variant="landing"
                      size="compact"
                      narrowMobileTypography
                      priority={copyIndex === 1 && pkgIndex < 2}
                      className="h-full min-w-0"
                    />
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
        </div>

        <button
          type="button"
          className={cn(navButtonClassName, "right-1 sm:right-2")}
          onClick={() => scrollByStep(1)}
          disabled={!useInfinite}
          aria-label="Ver próximo pacote"
        >
          <ChevronRight className={navIconClassName} aria-hidden />
        </button>
      </div>

      <PackageCarouselScrollHint className="mt-[0.525rem] text-center text-[0.7725rem] sm:mt-[0.65625rem] md:mt-[0.7875rem]" />
    </div>
  );
}
