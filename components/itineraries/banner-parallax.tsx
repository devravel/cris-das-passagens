"use client";

import { useEffect, useRef } from "react";

/**
 * Parallax da referência (dzsparallaxer, mode-scroll): a foto é mais alta que
 * a faixa e desce mais devagar que a página ao rolar; voltando ao topo, volta
 * ao lugar. Só transform, num rAF; desligado com prefers-reduced-motion.
 */
export function BannerParallax({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const banner = element.parentElement;
      if (!banner) return;
      const rect = banner.getBoundingClientRect();
      // Quanto da faixa já passou pra cima da tela (0 no topo da página).
      const scrolled = Math.max(0, -rect.top);
      element.style.transform = `translate3d(0, ${scrolled * 0.35}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className="absolute inset-x-0 top-0 h-[140%] will-change-transform" aria-hidden>
      {children}
    </div>
  );
}
