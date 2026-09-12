"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { X } from "lucide-react";

import { siteConfig } from "@/config/site";
import { useMotionReady } from "@/hooks/use-motion-ready";
import { trackMetaLead } from "@/lib/meta-pixel";
import { cn } from "@/lib/utils";

/*
  Balão "Fale conosco!": fechado fica fechado até o visitante sair do site
  (sessionStorage). useSyncExternalStore pra ler sem divergir do HTML do servidor.
*/
const BANNER_KEY = "whatsapp-fab-banner-closed";
const bannerListeners = new Set<() => void>();
// Fallback pra quando o storage está bloqueado (modo privado, etc.).
let bannerClosedInMemory = false;

function subscribeBanner(listener: () => void) {
  bannerListeners.add(listener);
  return () => bannerListeners.delete(listener);
}

function isBannerOpen() {
  if (bannerClosedInMemory) return false;
  try {
    return sessionStorage.getItem(BANNER_KEY) !== "1";
  } catch {
    return true;
  }
}

function closeBanner() {
  bannerClosedInMemory = true;
  try {
    sessionStorage.setItem(BANNER_KEY, "1");
  } catch {}
  bannerListeners.forEach((listener) => listener());
}

export type WhatsAppFabProps = {
  className?: string;
  label?: string;
};

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={cn("size-8", className)}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/**
 * Botão fixo do WhatsApp (referência: agenciayes.com.br) — anel pulsando,
 * brilho verde, tooltip no hover. Em cima dele, o balão "Fale conosco!"
 * que o visitante pode fechar; fica na mesma coluna do botão, então nunca
 * cobre conteúdo além do que o botão já cobre.
 */
export function WhatsAppFab({
  className,
  label = "Fale conosco!",
}: WhatsAppFabProps) {
  const pathname = usePathname();
  const { shouldAnimate } = useMotionReady();
  const bannerOpen = useSyncExternalStore(subscribeBanner, isBannerOpen, () => true);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <motion.div
      className={cn(
        "fixed z-[100] flex flex-col items-end gap-3",
        "bottom-[max(2rem,env(safe-area-inset-bottom))] right-[max(2rem,env(safe-area-inset-right))]",
        className,
      )}
      initial={shouldAnimate ? { opacity: 0, y: 16 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {bannerOpen ? (
        <div
          role="status"
          className="flex items-center gap-1 rounded-full bg-white py-1.5 pr-1.5 pl-3.5 text-[0.8125rem] font-semibold text-brand-navy shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)] ring-1 ring-black/5"
        >
          {label}
          <button
            type="button"
            onClick={closeBanner}
            aria-label="Fechar aviso"
            className="flex size-6 items-center justify-center rounded-full text-brand-navy/55 transition-colors hover:bg-brand-navy/8 hover:text-brand-navy"
          >
            <X className="size-3.5" strokeWidth={2.5} aria-hidden />
          </button>
        </div>
      ) : null}

      <a
        href={siteConfig.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          trackMetaLead({
            source: "whatsapp_fab",
            content_name: "WhatsApp FAB",
            content_category: "contact",
          })
        }
        aria-label="Falar no WhatsApp com a Cris das Passagens"
        className="group relative block size-16 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-brand-whatsapp/50"
      >
        <span
          aria-hidden
          className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-25 group-hover:opacity-40 motion-reduce:animate-none"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-full mr-4 -translate-y-1/2 rounded-xl border border-white/10 bg-brand-navy/80 px-4 py-2 font-mono text-xs tracking-widest whitespace-nowrap text-white uppercase opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100"
        >
          Fale conosco agora
        </span>
        <span className="relative flex size-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_rgba(37,211,102,0.4)] transition-all group-hover:shadow-[0_15px_40px_rgba(37,211,102,0.6)]">
          <WhatsAppIcon />
        </span>
      </a>
    </motion.div>
  );
}
