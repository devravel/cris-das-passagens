"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";

import { useConsent } from "@/components/consent/consent-context";
import { DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { CtaButton } from "@/components/ui/cta-button";
import type { LivePromotion } from "@/lib/promotion/schemas";
import { isOptimizableRemoteImage, resolvePublicImageSrc } from "@/lib/storage/image-src";

/** Espera depois que a página termina de carregar, pra não atropelar a primeira olhada. */
const POPUP_DELAY_MS = 2500;

let livePromotionRequest: Promise<LivePromotion | null> | null = null;

/** Uma requisição por carregamento de página, dividida entre o pop-up e o menu. */
function fetchLivePromotion() {
  livePromotionRequest ??= fetch("/api/promocao-ativa")
    .then((response) => (response.ok ? response.json() : null))
    .then((data: { promotion?: LivePromotion | null } | null) => data?.promotion ?? null)
    .catch(() => null);

  return livePromotionRequest;
}

export function useLivePromotion() {
  const [promotion, setPromotion] = useState<LivePromotion | null>(null);

  useEffect(() => {
    let alive = true;
    void fetchLivePromotion().then((next) => {
      if (alive) setPromotion(next);
    });
    return () => {
      alive = false;
    };
  }, []);

  return promotion;
}

export function getPromotionHref(slug: string) {
  return `/promocoes/${slug}`;
}

type PromotionCardProps = {
  name: string;
  image: string;
  ctaLabel: string;
  /** Sem href (prévia do painel) o botão não leva a lugar nenhum. */
  href?: string;
  onCtaClick?: () => void;
};

/** Arte + botão — o conteúdo do pop-up, reaproveitado na prévia do painel. */
export function PromotionCard({ name, image, ctaLabel, href, onCtaClick }: PromotionCardProps) {
  const src = resolvePublicImageSrc(image);

  return (
    <>
      <Image
        src={src}
        alt={name}
        width={1080}
        height={1350}
        sizes="(max-width: 480px) 100vw, 416px"
        unoptimized={!isOptimizableRemoteImage(src)}
        className="block h-auto max-h-[calc(100dvh-10rem)] w-full bg-muted/40 object-contain"
      />
      <div className="p-3 sm:p-4">
        <CtaButton
          href={href}
          label={ctaLabel}
          onClick={onCtaClick}
          className="h-auto min-h-12 w-full whitespace-normal py-3 text-center sm:min-h-13"
        />
      </div>
    </>
  );
}

const SEEN_KEY_PREFIX = "promo-popup-visto:";

// Uma vez por visita: some ao fechar a aba. Em aba anônima/bloqueada o storage
// pode lançar erro — aí o pop-up aparece normalmente.
function wasSeen(slug: string) {
  try {
    return window.sessionStorage.getItem(SEEN_KEY_PREFIX + slug) === "1";
  } catch {
    return false;
  }
}

function markSeen(slug: string) {
  try {
    window.sessionStorage.setItem(SEEN_KEY_PREFIX + slug, "1");
  } catch {
    // sem storage, segue sem lembrar
  }
}

export function PromotionPopup() {
  const pathname = usePathname();
  const promotion = useLivePromotion();
  const consent = useConsent();
  const [open, setOpen] = useState(false);
  // No painel não faz sentido; na página da promoção a pessoa já chegou.
  // Com o banner de cookies na tela, espera a resposta: os dois juntos se
  // cobrem no celular, e o Esc do banner recusa os cookies.
  const blocked =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/promocoes/") ||
    !consent.isReady ||
    consent.isBannerVisible ||
    consent.isModalOpen;

  useEffect(() => {
    if (!promotion || blocked || wasSeen(promotion.slug)) return;

    let timer: number | undefined;
    const schedule = () => {
      timer = window.setTimeout(() => {
        markSeen(promotion.slug);
        setOpen(true);
      }, POPUP_DELAY_MS);
    };

    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", schedule);
    };
  }, [promotion, blocked]);

  if (!promotion) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPortal>
        {/* Acima do botão do WhatsApp (z-100); o banner de cookies (z-1100) nem chega a dividir a tela. */}
        <DialogOverlay className="z-[200] bg-black/55" />
        <DialogPrimitive.Content
          data-promotion-popup
          aria-describedby={undefined}
          className="fixed top-1/2 left-1/2 z-[200] w-[min(100vw-2rem,26rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-card shadow-2xl ring-1 ring-black/10 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 motion-reduce:animate-none"
        >
          <DialogPrimitive.Title className="sr-only">{promotion.name}</DialogPrimitive.Title>
          {/* Primeiro no DOM: é onde o foco cai ao abrir. */}
          <DialogPrimitive.Close
            aria-label="Fechar"
            className="absolute top-2.5 right-2.5 flex size-10 items-center justify-center rounded-xl bg-background/90 text-foreground shadow-md ring-1 ring-black/10 backdrop-blur-sm transition-colors hover:bg-background focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <XIcon className="size-5" aria-hidden />
          </DialogPrimitive.Close>
          <PromotionCard
            name={promotion.name}
            image={promotion.image}
            ctaLabel={promotion.ctaLabel}
            href={getPromotionHref(promotion.slug)}
            onCtaClick={() => setOpen(false)}
          />
        </DialogPrimitive.Content>
      </DialogPortal>
    </DialogPrimitive.Root>
  );
}
