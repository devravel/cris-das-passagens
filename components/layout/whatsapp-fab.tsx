"use client";

import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { siteConfig } from "@/config/site";
import { trackMetaLead } from "@/lib/meta-pixel";
import { cn } from "@/lib/utils";
import { whatsappSolidButtonClassName } from "@/lib/whatsapp-styles";

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
      className={cn("size-7", className)}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function WhatsAppFab({
  className,
  label = "Em que podemos ajudar?",
}: WhatsAppFabProps) {
  const pathname = usePathname();
  const [showBanner, setShowBanner] = useState(true);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed z-50",
        "bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))]",
        className,
      )}
    >
      <div className="relative size-14">
        {showBanner ? (
          <div
            className={cn(
              "absolute bottom-full right-full -mb-[2px] -mr-[2px] w-max max-w-[min(16rem,calc(100vw-5rem))]",
              "rounded-md bg-background/95 px-4 py-3 pr-8 text-sm tracking-wide leading-snug text-foreground shadow-[0_2px_12px_rgba(0,0,0,0.12)] ring-1 ring-border/60 backdrop-blur-sm",
            )}
          >
            <button
              type="button"
              onClick={() => setShowBanner(false)}
              aria-label="Fechar mensagem"
              className="absolute top-1.5 right-1.5 cursor-pointer rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="size-3.5" strokeWidth={1.75} aria-hidden />
            </button>
            {label}
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
          className={cn(
            "flex size-14 items-center justify-center rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.18)] transition-[transform,box-shadow,background-color] duration-200 hover:scale-105 hover:shadow-[0_6px_24px_rgba(0,0,0,0.22)] active:scale-95 motion-reduce:transition-none motion-reduce:hover:scale-100",
            whatsappSolidButtonClassName,
          )}
        >
          <WhatsAppIcon />
        </a>
      </div>
    </div>
  );
}
