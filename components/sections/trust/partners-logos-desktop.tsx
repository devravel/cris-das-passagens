"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {
  partnerLogoGapClassName,
  PartnerLogoImage,
  type PartnerLogoEntry,
} from "@/components/sections/trust/partners-logo-shared";
import { cn } from "@/lib/utils";

/** ~36px/s — mesmo fluxo horizontal lento do mobile. */
const AUTOPLAY_SPEED_PX_PER_MS = 0.036;
/** Limite de cópias renderizadas para o loop infinito. */
const MAX_COPIES = 8;

export function PartnersLogosDesktop({
  logos,
}: {
  logos: readonly PartnerLogoEntry[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLUListElement>(null);
  const firstItemRef = useRef<HTMLLIElement | null>(null);
  const lastItemRef = useRef<HTMLLIElement | null>(null);

  // Estado que afeta render.
  const [needsAutoplay, setNeedsAutoplay] = useState(false);
  const [copies, setCopies] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Medições e flags vivem em refs.
  const loopSegmentRef = useRef(0);
  const oneCopyWidthRef = useRef(0);
  const reduceMotionRef = useRef(false);

  const isPausedRef = useRef(false);
  const isHoverRef = useRef(false);
  const isFocusRef = useRef(false);

  const rafRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);

  const applyPaused = useCallback(() => {
    const paused =
      isHoverRef.current ||
      isFocusRef.current ||
      (typeof document !== "undefined" && document.hidden);

    isPausedRef.current = paused;
    setIsPaused((current) => (current === paused ? current : paused));
  }, []);

  const measureLayout = useCallback(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    const first = firstItemRef.current;
    const last = lastItemRef.current;

    if (!container || !content || !first || !last) {
      return;
    }

    const containerWidth = container.clientWidth;
    const styles = window.getComputedStyle(content);
    const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
    const oneCopyWidth =
      last.offsetLeft + last.offsetWidth - first.offsetLeft;
    const loopSegment = oneCopyWidth + gap;

    oneCopyWidthRef.current = oneCopyWidth;
    loopSegmentRef.current = loopSegment;

    // Verifica se precisa de autoplay: conteúdo não cabe no container.
    const needsScroll = oneCopyWidth > containerWidth;
    setNeedsAutoplay((current) => (current === needsScroll ? current : needsScroll));

    // Cópias para loop infinito apenas se precisar de autoplay.
    let nextCopies = 1;

    if (!reduceMotionRef.current && needsScroll && loopSegment > 0 && containerWidth > 0) {
      nextCopies = Math.min(
        MAX_COPIES,
        Math.max(2, 1 + Math.ceil((containerWidth + gap) / loopSegment)),
      );
    }

    setCopies((current) => (current === nextCopies ? current : nextCopies));
  }, []);

  // Sincroniza refs auxiliares.
  useEffect(() => {
    reduceMotionRef.current = reduceMotion;
  }, [reduceMotion]);

  // Preferência de movimento reduzido.
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reduceMotionRef.current = media.matches;
      setReduceMotion(media.matches);
    };

    update();
    media.addEventListener("change", update);

    return () => {
      media.removeEventListener("change", update);
    };
  }, []);

  // Mede o layout no mount e sempre que o conteúdo/cópias mudarem.
  useLayoutEffect(() => {
    measureLayout();
  }, [logos, copies, reduceMotion, measureLayout]);

  // Recalcula quando o container ou o conteúdo mudam de tamanho.
  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;

    if (!container || !content) {
      return;
    }

    const observer = new ResizeObserver(() => {
      measureLayout();
    });

    observer.observe(container);
    observer.observe(content);
    window.addEventListener("resize", measureLayout);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measureLayout);
    };
  }, [measureLayout]);

  // Loop de animação: fluxo horizontal constante via scrollLeft (apenas se needsAutoplay).
  useEffect(() => {
    if (!needsAutoplay || reduceMotion || isPaused || logos.length === 0) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      lastFrameTimeRef.current = null;
      return;
    }

    const tick = (timestamp: number) => {
      const container = containerRef.current;

      if (!container || isPausedRef.current || document.hidden) {
        lastFrameTimeRef.current = null;
        rafRef.current = null;
        return;
      }

      const loop = loopSegmentRef.current;

      if (loop <= 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (lastFrameTimeRef.current === null) {
        lastFrameTimeRef.current = timestamp;
      }

      const deltaMs = Math.min(timestamp - lastFrameTimeRef.current, 48);
      lastFrameTimeRef.current = timestamp;

      let next = container.scrollLeft + AUTOPLAY_SPEED_PX_PER_MS * deltaMs;

      while (next >= loop) {
        next -= loop;
      }

      container.scrollLeft = next;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      lastFrameTimeRef.current = null;
    };
  }, [needsAutoplay, isPaused, reduceMotion, logos.length]);

  // Pausa quando a aba fica oculta.
  useEffect(() => {
    function handleVisibilityChange() {
      if (!document.hidden) {
        lastFrameTimeRef.current = null;
      }

      applyPaused();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [applyPaused]);

  return (
    <div
      className="mx-auto hidden w-full max-w-6xl lg:block"
      onMouseEnter={() => {
        isHoverRef.current = true;
        applyPaused();
      }}
      onMouseLeave={() => {
        isHoverRef.current = false;
        applyPaused();
      }}
      onFocusCapture={() => {
        isFocusRef.current = true;
        applyPaused();
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          isFocusRef.current = false;
          applyPaused();
        }
      }}
    >
      <div
        ref={containerRef}
        className={cn(
          needsAutoplay
            ? "overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : "overflow-hidden",
        )}
      >
        <ul
          ref={contentRef}
          className={cn(
            "flex w-max items-center",
            partnerLogoGapClassName,
            needsAutoplay ? "justify-start" : "min-w-full justify-center",
          )}
        >
          {Array.from({ length: copies }, (_, copyIndex) => (
            <Fragment key={copyIndex}>
              {logos.map((logo, logoIndex) => (
                <li
                  key={`${copyIndex}-${logoIndex}-${logo.src}`}
                  ref={
                    copyIndex === 0
                      ? (element) => {
                          if (logoIndex === 0) {
                            firstItemRef.current = element;
                          }

                          if (logoIndex === logos.length - 1) {
                            lastItemRef.current = element;
                          }
                        }
                      : undefined
                  }
                  className="flex shrink-0 items-center justify-center"
                  aria-hidden={copyIndex !== 0}
                >
                  <PartnerLogoImage logo={logo} />
                </li>
              ))}
            </Fragment>
          ))}
        </ul>
      </div>
    </div>
  );
}