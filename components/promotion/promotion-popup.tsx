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
import { resolvePublicImageSrc } from "@/lib/storage/image-src";

/** Respiro curto depois que o site fica interativo (sem esperar as fotos da página). */
const POPUP_DELAY_MS = 400;

let livePromotionRequest: { path: string; promise: Promise<LivePromotion | null> } | null = null;

/**
 * Uma requisição por página, dividida entre o pop-up e o menu. Busca de novo a
 * cada troca de rota: a navegação interna não recarrega a página, e quem
 * cadastra a promoção no painel e volta pro site precisa ver ela na hora.
 */
function fetchLivePromotion(path: string) {
  if (livePromotionRequest?.path !== path) {
    livePromotionRequest = {
      path,
      promise: fetch("/api/promocao-ativa", { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : null))
        .then((data: { promotion?: LivePromotion | null } | null) => data?.promotion ?? null)
        .catch(() => null),
    };
  }

  return livePromotionRequest.promise;
}

export function useLivePromotion() {
  const pathname = usePathname();
  const [promotion, setPromotion] = useState<LivePromotion | null>(null);

  useEffect(() => {
    let alive = true;
    void fetchLivePromotion(pathname).then((next) => {
      if (alive) setPromotion(next);
    });
    return () => {
      alive = false;
    };
  }, [pathname]);

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

/**
 * Arte + botão, sem moldura: a imagem aparece no tamanho dela (qualquer
 * proporção, sem faixa nas laterais) e o botão fica embaixo, na mesma largura.
 * Reaproveitado na prévia do painel.
 */
export function PromotionCard({ name, image, ctaLabel, href, onCtaClick }: PromotionCardProps) {
  const src = resolvePublicImageSrc(image);

  return (
    <div className="flex w-max max-w-full flex-col gap-3">
      <Image
        src={src}
        alt={name}
        width={1080}
        height={1350}
        // Arquivo já comprimido no upload; sem otimizar, a URL é a mesma do pré-carregamento.
        unoptimized
        className="block h-auto max-h-[calc(100dvh-9rem)] w-auto max-w-full rounded-2xl shadow-2xl sm:max-w-[26rem]"
      />
      {/* w-0 + min-w-full: o botão acompanha a largura da arte em vez de alargar o pop-up. */}
      <div className="w-0 min-w-full">
        <CtaButton
          href={href}
          label={ctaLabel}
          onClick={onCtaClick}
          className="h-auto min-h-12 w-full whitespace-normal py-3 text-center sm:min-h-13"
        />
      </div>
    </div>
  );
}

// Abre uma vez por carregamento: recarregar (F5) mostra de novo, mas trocar de
// página pelo menu (navegação interna, sem recarregar) não reabre.
let shownThisLoad = false;

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
    if (!promotion || blocked || shownThisLoad) return;

    // Abre quando a arte já baixou (nada de caixa vazia) e passou o respiro.
    let cancelled = false;
    const delay = new Promise((resolve) => window.setTimeout(resolve, POPUP_DELAY_MS));
    const art = new window.Image();
    const loaded = new Promise((resolve) => {
      art.onload = art.onerror = resolve;
    });
    art.src = resolvePublicImageSrc(promotion.image);

    void Promise.all([delay, loaded]).then(() => {
      if (cancelled) return;
      shownThisLoad = true;
      setOpen(true);
    });

    return () => {
      cancelled = true;
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
          // Foco no próprio pop-up (não no X): leitor de tela entra nele e o X
          // não abre com o anel de foco aceso.
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            (event.currentTarget as HTMLElement | null)?.focus();
          }}
          className="fixed top-1/2 left-1/2 z-[200] w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 motion-reduce:animate-none"
        >
          <DialogPrimitive.Title className="sr-only">{promotion.name}</DialogPrimitive.Title>
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
