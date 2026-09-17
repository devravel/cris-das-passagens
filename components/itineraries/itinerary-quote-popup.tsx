"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { ItineraryQuoteForm } from "@/components/itineraries/itinerary-quote-form";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { StorageImage } from "@/components/ui/storage-image";
import { hasStoredConsentChoice } from "@/lib/consent/storage";

type ItineraryQuotePopupProps = {
  title: string;
  image: string;
  hotelOptions: string[];
};

/** Abre depois de X segundos ou quando o visitante passa da metade da página, o que vier primeiro. */
const OPEN_AFTER_MS = 30_000;
const OPEN_AT_SCROLL = 0.5;
/** Uma vez por visita (sessão do navegador), por roteiro. */
const STORAGE_KEY = "roteiro-popup";

function alreadyShown(slugKey: string) {
  try {
    return sessionStorage.getItem(`${STORAGE_KEY}:${slugKey}`) === "1";
  } catch {
    return false;
  }
}

function markShown(slugKey: string) {
  try {
    sessionStorage.setItem(`${STORAGE_KEY}:${slugKey}`, "1");
  } catch {
    // storage bloqueado: mostra de novo na próxima navegação, sem quebrar
  }
}

export function ItineraryQuotePopup({ title, image, hotelOptions }: ItineraryQuotePopupProps) {
  const [open, setOpen] = useState(false);
  const slugKey = typeof window === "undefined" ? title : window.location.pathname;

  useEffect(() => {
    if (alreadyShown(slugKey)) return;

    let done = false;
    let waitingConsent = 0;
    const trigger = () => {
      if (done) return;
      // Aviso de cookies ainda na tela: espera a pessoa decidir, senão são dois avisos de uma vez.
      if (!hasStoredConsentChoice()) {
        if (!waitingConsent) waitingConsent = window.setInterval(trigger, 1500);
        return;
      }
      if (waitingConsent) window.clearInterval(waitingConsent);
      done = true;
      // Formulário lateral já na tela (desktop, sticky) ou em uso: popup seria redundante.
      const sidebarForm = document.querySelector("aside [data-quote-form]");
      const rect = sidebarForm?.getBoundingClientRect();
      const sidebarVisible = rect ? rect.top < window.innerHeight && rect.bottom > 0 : false;
      if (sidebarVisible || document.activeElement?.closest("[data-quote-form]")) return;
      markShown(slugKey);
      setOpen(true);
    };

    const timer = window.setTimeout(trigger, OPEN_AFTER_MS);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max >= OPEN_AT_SCROLL) trigger();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      if (waitingConsent) window.clearInterval(waitingConsent);
      window.removeEventListener("scroll", onScroll);
    };
  }, [slugKey]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border-0 bg-brand-navy p-0 text-white shadow-2xl ring-0 sm:max-w-md"
      >
        <div className="relative h-32 w-full sm:h-40">
          {image ? (
            <StorageImage
              src={image}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 448px"
              containerClassName="absolute inset-0"
              className="object-cover"
            />
          ) : null}
          <div aria-hidden className="absolute inset-0 bg-linear-to-t from-brand-navy to-brand-navy/10" />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar"
            className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          >
            <X className="size-4.5" aria-hidden />
          </button>
          <p className="absolute inset-x-5 bottom-3 text-xs font-semibold uppercase tracking-wider text-brand-cyan drop-shadow">
            Quer levar esse roteiro?
          </p>
        </div>

        <DialogTitle className="sr-only">Informações e reservas: {title}</DialogTitle>
        <DialogDescription className="sr-only">
          Preencha o que já souber e fale com a gente no WhatsApp.
        </DialogDescription>

        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <ItineraryQuoteForm title={title} hotelOptions={hotelOptions} embedded idPrefix="popup" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
