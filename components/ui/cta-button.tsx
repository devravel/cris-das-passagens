"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { trackMetaLeadFromHref, type MetaLeadSource } from "@/lib/meta-pixel";
import { cn } from "@/lib/utils";

const sizeClassName = {
  /** Navbar no mobile — encolhe com a tela (clamp) pra manter respiro entre logo e menu. */
  sm: "h-[clamp(2.125rem,9.5vw,2.5rem)] gap-[clamp(0.25rem,1.5vw,0.5rem)] px-[clamp(0.5rem,3vw,0.875rem)] text-[clamp(0.6875rem,3.2vw,0.8125rem)]",
  /** Padrão de todo CTA do site (hero, navbar, seções). */
  default: "h-12 gap-3 px-6 text-[0.9375rem] sm:h-13 sm:px-7 sm:text-base",
  /** Destaque centralizado ("Ver todos os pacotes"). */
  xl: "h-14 gap-3.5 px-9 text-lg sm:h-16 sm:px-12 sm:text-xl",
} as const;

const arrowSizeClassName = {
  sm: "size-[clamp(1.125rem,5.5vw,1.5rem)] [&>svg]:size-[clamp(0.75rem,3.4vw,0.875rem)]",
  default: "size-7 [&>svg]:size-4",
  xl: "size-9 [&>svg]:size-5",
} as const;

export type CtaButtonProps = {
  href?: string;
  label: React.ReactNode;
  variant?: "brand" | "ghost";
  size?: keyof typeof sizeClassName;
  /** Seta pra cima-direita com fundo próprio; some com `false`. */
  arrow?: boolean;
  trackingSource?: MetaLeadSource;
  className?: string;
  onClick?: () => void;
} & Pick<React.ComponentProps<"button">, "type" | "disabled">;

/**
 * CTA da marca: vidro azul, brilho a cada 1,5s, preenche no hover e cresce a
 * partir do ponto do mouse (visual todo em `.cta-btn`, globals.css).
 * Vira `<a>`, `<Link>` ou `<button>` conforme `href`/`type`.
 */
export function CtaButton({
  href,
  label,
  variant = "brand",
  size = "default",
  arrow = true,
  trackingSource,
  className,
  onClick,
  type,
  disabled,
}: CtaButtonProps) {
  const classes = cn(
    "cta-btn inline-flex shrink-0 select-none items-center justify-center rounded-xl font-semibold whitespace-nowrap outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-60",
    variant === "ghost" && "cta-btn--ghost",
    sizeClassName[size],
    className,
  );

  const children = (
    <>
      <span aria-hidden className="cta-btn__spot" />
      <span className="relative">{label}</span>
      {arrow ? (
        <span aria-hidden className={cn("cta-btn__arrow relative", arrowSizeClassName[size])}>
          <ArrowUpRight strokeWidth={2.25} />
        </span>
      ) : null}
    </>
  );

  // Ponto do mouse em % do botão — alimenta o transform-origin e o brilho.
  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--cta-mx",
      `${((event.clientX - rect.left) / rect.width) * 100}%`,
    );
    event.currentTarget.style.setProperty(
      "--cta-my",
      `${((event.clientY - rect.top) / rect.height) * 100}%`,
    );
  };

  if (!href) {
    return (
      <button
        type={type ?? "button"}
        disabled={disabled}
        className={classes}
        onPointerMove={onPointerMove}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }

  if (href.startsWith("http")) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        onPointerMove={onPointerMove}
        onClick={() => {
          if (trackingSource) {
            trackMetaLeadFromHref(href, {
              source: trackingSource,
              content_name: typeof label === "string" ? label : undefined,
            });
          }
          onClick?.();
        }}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} onPointerMove={onPointerMove} onClick={onClick}>
      {children}
    </Link>
  );
}
