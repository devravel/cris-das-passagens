"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import { XIcon } from "lucide-react";

import { useConsent } from "@/components/consent/consent-context";
import { DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { CtaButton } from "@/components/ui/cta-button";
import { trackGoogleAnalyticsEvent } from "@/lib/google-analytics";
import { trackMetaCustomEvent } from "@/lib/meta-pixel";
import type { LivePromotion } from "@/lib/promotion/schemas";
import { resolvePublicImageSrc } from "@/lib/storage/image-src";

/** Insistente: respiro curto depois que o site fica interativo. */
const INSISTENT_DELAY_MS = 400;
/** Normal: 5s, ou antes se a pessoa rolar meia tela (sinal de interesse). */
const NORMAL_DELAY_MS = 5000;
const NORMAL_SCROLL_RATIO = 0.5;
/** Normal: fechou, só volta depois disso. Clicou no botão, não volta mais. */
const REOPEN_AFTER_CLOSE_MS = 24 * 60 * 60 * 1000;

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

// Abre uma vez por carregamento: trocar de página pelo menu (navegação
// interna, sem recarregar) não reabre.
let shownThisLoad = false;

type SeenRecord = { closedAt?: number; clicked?: boolean };

// Lembrança por promoção, só neste navegador. Aba anônima/storage bloqueado:
// lança erro e o pop-up segue como se fosse a primeira visita.
function readSeen(slug: string): SeenRecord {
  try {
    return JSON.parse(window.localStorage.getItem(`promo-popup:${slug}`) ?? "{}") ?? {};
  } catch {
    return {};
  }
}

function writeSeen(slug: string, record: SeenRecord) {
  try {
    window.localStorage.setItem(`promo-popup:${slug}`, JSON.stringify(record));
  } catch {
    // sem storage, segue sem lembrar
  }
}

function shouldShow(promotion: LivePromotion) {
  if (promotion.displayMode === "INSISTENT") return true;
  const seen = readSeen(promotion.slug);
  if (seen.clicked) return false;
  return !seen.closedAt || Date.now() - seen.closedAt >= REOPEN_AFTER_CLOSE_MS;
}

const TRACKING_EVENTS = {
  view: { ga: "promo_popup_view", meta: "PromoPopupView" },
  close: { ga: "promo_popup_close", meta: "PromoPopupClose" },
  click: { ga: "promo_popup_click", meta: "PromoPopupClick" },
} as const;

/** Exibição, fechamento e clique — no Analytics e no pixel (só com consentimento). */
function trackPopup(action: keyof typeof TRACKING_EVENTS, slug: string) {
  trackGoogleAnalyticsEvent(TRACKING_EVENTS[action].ga, { promotion: slug });
  trackMetaCustomEvent(TRACKING_EVENTS[action].meta, { promotion: slug });
}

/** Espera o momento de abrir conforme o modo. Devolve a função que cancela. */
function waitForTrigger(promotion: LivePromotion, onReady: () => void) {
  const cleanups: (() => void)[] = [];
  let fired = false;
  const fire = () => {
    if (fired) return;
    fired = true;
    cleanups.forEach((cleanup) => cleanup());
    onReady();
  };

  const insistent = promotion.displayMode === "INSISTENT";
  const timer = window.setTimeout(fire, insistent ? INSISTENT_DELAY_MS : NORMAL_DELAY_MS);
  cleanups.push(() => window.clearTimeout(timer));

  if (!insistent) {
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * NORMAL_SCROLL_RATIO) fire();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener("scroll", onScroll));
  }

  return () => cleanups.forEach((cleanup) => cleanup());
}

export function PromotionPopup() {
  const pathname = usePathname();
  const promotion = useLivePromotion();
  const consent = useConsent();
  const [open, setOpen] = useState(false);
  // Só na página inicial (pedido do Cris): no blog e nas outras páginas atrapalha
  // a leitura. Com o banner de cookies na tela, espera a resposta: os dois
  // juntos se cobrem no celular, e o Esc do banner recusa os cookies.
  const blocked =
    pathname !== "/" ||
    !consent.isReady ||
    consent.isBannerVisible ||
    consent.isModalOpen;

  useEffect(() => {
    if (!promotion || blocked || shownThisLoad || !shouldShow(promotion)) return;

    // Abre só com a arte já baixada (nada de caixa vazia) e no momento do modo.
    let cancelled = false;
    const art = new window.Image();
    const loaded = new Promise((resolve) => {
      art.onload = art.onerror = resolve;
    });
    art.src = resolvePublicImageSrc(promotion.image);

    let cancelTrigger = () => {};
    const triggered = new Promise<void>((resolve) => {
      cancelTrigger = waitForTrigger(promotion, resolve);
    });

    void Promise.all([triggered, loaded]).then(() => {
      if (cancelled) return;
      shownThisLoad = true;
      setOpen(true);
      trackPopup("view", promotion.slug);
    });

    return () => {
      cancelled = true;
      cancelTrigger();
    };
  }, [promotion, blocked]);

  if (!promotion) return null;

  return (
    <DialogPrimitive.Root
      open={open}
      // Só dispara ao fechar pelo X, Esc ou clique fora; o botão fecha por conta própria.
      onOpenChange={(next) => {
        setOpen(next);
        if (next) return;
        writeSeen(promotion.slug, { closedAt: Date.now() });
        trackPopup("close", promotion.slug);
      }}
    >
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
            onCtaClick={() => {
              writeSeen(promotion.slug, { clicked: true });
              trackPopup("click", promotion.slug);
              setOpen(false);
            }}
          />
        </DialogPrimitive.Content>
      </DialogPortal>
    </DialogPrimitive.Root>
  );
}
