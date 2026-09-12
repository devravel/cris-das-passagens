"use client";

import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { BedDouble, Package, Plane, ShieldCheck, type LucideIcon } from "lucide-react";

import { TiltCard } from "@/components/motion/tilt-card";
import { ReiDaCopaHeroCta } from "@/components/rei-da-copa/rei-da-copa-hero-cta";
import { highlightTitle } from "@/components/layout/section-header";
import { CtaButton } from "@/components/ui/cta-button";
import { content, type ContentCta, type ServiceItem } from "@/config/content";
import { reiDaCopaHomeHeroCta } from "@/config/rei-da-copa-campaign";
import { trackMetaLeadFromHref } from "@/lib/meta-pixel";
import { cn } from "@/lib/utils";

export type TourismHeroProps = {
  headline?: string;
  subheadline?: string;
  services?: ServiceItem[];
  primaryCta?: ContentCta;
  secondaryCta?: ContentCta;
  image?: string;
  imageMobile?: string;
  imageAlt?: string;
  className?: string;
};

/**
 * Fundo da hero: a ilustração com o Cris, sem véu no desktop — a própria arte já
 * é escura na esquerda. Um `<picture>` com `media` faz o browser baixar SÓ a arte
 * do breakpoint ativo (com dois `<Image>` + display:none, o desktop baixava a
 * arte mobile e vice-versa). `getImageProps` gera o srcset otimizado de cada uma.
 * Sem o arquivo, fica o navy com brilhos.
 */
function HeroBackdrop({
  src,
  mobileSrc,
  alt,
}: {
  src: string;
  mobileSrc?: string;
  alt: string;
}) {
  const [failed, setFailed] = useState(false);
  const common = { alt, fill: true, priority: true, quality: 92 } as const;
  // Desktop (1.78:1): em caixa mais alta que 16:9 (tablet retrato, janela
  // estreita) o cover é limitado pela altura e a arte renderiza bem mais larga
  // que a viewport (~220vw em 768x1024) — abaixo de lg pede a maior candidata,
  // senão vem menor que o render e fica pixelada. vh não vale em `sizes`.
  const { props: desktop } = getImageProps({
    ...common,
    src,
    sizes: "(max-width: 1023px) 220vw, 100vw",
  });
  // Mobile (855x1375, ver prints/prompt-hero-mobile-chatgpt.md): 100vw em DPR ≥ 2
  // já pede mais que a fonte tem, então vem sempre a arte inteira.
  const { props: mobile } = mobileSrc
    ? getImageProps({ ...common, src: mobileSrc, sizes: "100vw" })
    : { props: null };

  return (
    <div className="absolute inset-0 overflow-hidden bg-brand-navy">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60%_80%_at_85%_20%,oklch(0.75_0.15_222/0.35),transparent_60%),radial-gradient(50%_60%_at_15%_90%,oklch(0.591_0.119_264.6/0.45),transparent_65%)]"
      />
      {!failed ? (
        <picture>
          {mobile ? (
            <source
              media="(max-width: 639px)"
              srcSet={mobile.srcSet}
              sizes={mobile.sizes}
            />
          ) : null}
          <img
            {...desktop}
            alt={alt}
            // LCP: sem o preload que o <Image priority> emitiria (não dá pra
            // preload com media), a prioridade alta no próprio <img> é o que resta.
            fetchPriority="high"
            onError={() => setFailed(true)}
            className={cn(
              "object-cover",
              // <640px: a arte mobile já traz o Cris na direita com respiro em cima.
              // Ancorada em cima/direita, o cover corta só a esquerda (mapa/avião)
              // conforme a tela estreita; o chão fica sob o gradiente. O top
              // negativo sobe o Cris cortando só céu (offset positivo abriria faixa
              // navy = divisória); a altura compensa pra base seguir colada no fundo.
              // Nada de deslocar no eixo x: perto de 640px o cover vira width-bound
              // e qualquer offset abre faixa na esquerda — a barra de janela que
              // aparecia na direita foi recortada do próprio arquivo (935 → 855px).
              mobile && "-top-10! h-[calc(100%+2.5rem)]! object-right-top",
              // ≥640px: arte desktop, enquadramento original.
              "sm:top-0! sm:h-full! sm:object-[72%_center] lg:object-[center_15%]",
            )}
          />
        </picture>
      ) : null}
      {mobile ? (
        <>
          {/* Véu azul só no mobile (<640px): multiply escurece puxando pro azul da
              marca sem blur — a arte continua nítida, o texto ganha contraste. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-brand/35 mix-blend-multiply sm:hidden"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[55%] bg-linear-to-t from-brand-navy from-25% via-brand-navy/70 to-transparent sm:hidden"
          />
        </>
      ) : null}
    </div>
  );
}

/** Card quadrado com capa em foto — segundo ponto de atenção da hero. */
function ServiceCard({ service }: { service: ServiceItem }) {
  const isExternal = service.href.startsWith("http");
  const inner = (
    <>
      <Image
        src={service.image}
        alt=""
        fill
        sizes="(max-width: 640px) 45vw, 160px"
        className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110 motion-reduce:transition-none"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-brand-navy/90 via-brand-navy/25 to-transparent"
      />
      <span className="relative block p-3 font-heading text-sm font-bold leading-tight tracking-tight whitespace-pre-line text-white sm:text-[0.9375rem]">
        {service.label}
      </span>
    </>
  );
  const className =
    "group relative isolate flex aspect-square flex-col justify-end overflow-hidden rounded-2xl bg-brand-navy shadow-[0_18px_36px_-14px_rgba(0,0,0,0.65)] ring-1 ring-white/15 outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan";

  return (
    <TiltCard scale={1.06} lift={8} tilt={7}>
      {isExternal ? (
        <a
          href={service.href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
          onClick={() =>
            trackMetaLeadFromHref(service.href, {
              source: "hero_quote",
              content_name: service.label,
            })
          }
        >
          {inner}
        </a>
      ) : (
        <Link href={service.href} className={className}>
          {inner}
        </Link>
      )}
    </TiltCard>
  );
}

const serviceIcons: Record<ServiceItem["icon"], LucideIcon> = {
  plane: Plane,
  package: Package,
  bed: BedDouble,
  shield: ShieldCheck,
};

/** Abaixo de 640px: pílulas ícone + título rodando em marquee, sem foto. */
function ServicesMarquee({ services }: { services: ServiceItem[] }) {
  const pillClassName =
    "inline-flex h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold whitespace-nowrap text-white ring-1 ring-white/15 backdrop-blur-sm outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan";

  return (
    <div
      className="partners-marquee-viewport -mx-4 sm:hidden"
      style={{ "--partners-marquee-duration": "18s" } as CSSProperties}
      aria-label="Serviços oferecidos"
    >
      <div className="partners-marquee-track">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            className="partners-marquee-group flex items-center gap-2.5 pr-2.5"
            aria-hidden={copy !== 0}
          >
            {services.map((service) => {
              const Icon = serviceIcons[service.icon];
              const label = service.label.replace("\n", " ");
              const inner = (
                <>
                  <Icon className="size-4 text-brand-cyan" strokeWidth={2.25} aria-hidden />
                  {label}
                </>
              );

              return (
                <li key={service.label} className="shrink-0">
                  {service.href.startsWith("http") ? (
                    <a
                      href={service.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={copy === 0 ? undefined : -1}
                      className={pillClassName}
                      onClick={() =>
                        trackMetaLeadFromHref(service.href, {
                          source: "hero_quote",
                          content_name: label,
                        })
                      }
                    >
                      {inner}
                    </a>
                  ) : (
                    <Link
                      href={service.href}
                      tabIndex={copy === 0 ? undefined : -1}
                      className={pillClassName}
                    >
                      {inner}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        ))}
      </div>
    </div>
  );
}

export function TourismHero({
  headline = content.hero.headline,
  subheadline = content.hero.subheadline,
  services = content.hero.services,
  primaryCta = content.hero.primaryCta,
  secondaryCta = content.hero.secondaryCta,
  image = content.hero.image,
  imageMobile = content.hero.imageMobile,
  imageAlt = content.hero.imageAlt,
  className,
}: TourismHeroProps) {
  return (
    <section
      className={cn(
        // A hero fecha na dobra: 100svh menos a navbar sticky (18/20 de altura + borda).
        "relative isolate flex min-h-[calc(100svh-4.5rem-1px)] w-full flex-col justify-end text-white sm:min-h-[calc(100svh-5rem-1px)] lg:h-[calc(100svh-5rem-1px)] lg:min-h-0 lg:justify-center",
        className,
      )}
      aria-labelledby="hero-headline"
    >
      <HeroBackdrop src={image} mobileSrc={imageMobile} alt={imageAlt} />

      <div className="relative mx-auto w-full max-w-7xl px-4 pt-20 pb-8 sm:px-6 sm:pb-14 lg:px-8 lg:py-16">
        <div className="flex max-w-2xl flex-col gap-5 sm:gap-6">
          <p
            className="hero-enter flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] font-bold tracking-[0.16em] text-brand-cyan uppercase sm:text-xs"
            style={{ "--enter-delay": "0s" } as CSSProperties}
          >
            <span>
              {content.socialProof.emissions} {content.socialProof.emissionsLabel}
            </span>
            {/* No mobile os dois itens quebram de linha; o ponto ficaria sozinho. */}
            <span aria-hidden className="hidden text-white/40 sm:inline">
              •
            </span>
            <span>
              {content.socialProof.clients} {content.socialProof.clientsLabel}
            </span>
          </p>

          <h1
            id="hero-headline"
            className="hero-enter font-heading text-balance text-[2.5rem] font-bold leading-[1.02] tracking-[-0.02em] sm:text-5xl lg:text-[3.75rem] xl:text-[4.25rem]"
            style={{ "--enter-delay": "0.15s" } as CSSProperties}
          >
            {headline}
          </h1>

          <p
            className="hero-enter max-w-xl text-pretty text-base leading-relaxed text-white/80 sm:text-lg lg:text-xl"
            style={{ "--enter-delay": "0.3s" } as CSSProperties}
          >
            {subheadline}
          </p>

          <ul
            className="hero-enter hidden gap-4 sm:grid sm:grid-cols-4"
            style={{ "--enter-delay": "0.45s" } as CSSProperties}
            aria-label="Serviços oferecidos"
          >
            {services.map((service) => (
              <li key={service.label}>
                <ServiceCard service={service} />
              </li>
            ))}
          </ul>

          <div
            data-hero-cta
            className="hero-enter mt-1 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ "--enter-delay": "0.6s" } as CSSProperties}
          >
            {primaryCta.href === reiDaCopaHomeHeroCta.href ? (
              <ReiDaCopaHeroCta />
            ) : (
              <CtaButton
                href={primaryCta.href}
                label={primaryCta.label}
                trackingSource="hero_quote"
              />
            )}
            <CtaButton
              href={secondaryCta.href}
              label={highlightTitle(secondaryCta.label, true)}
              variant="ghost"
              arrow={false}
            />
          </div>

          <div className="hero-enter mt-1" style={{ "--enter-delay": "0.45s" } as CSSProperties}>
            <ServicesMarquee services={services} />
          </div>
        </div>
      </div>
    </section>
  );
}
