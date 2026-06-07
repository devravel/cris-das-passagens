import { hasMetaPixelConsent } from "@/lib/meta-pixel/consent";

declare global {
  interface Window {
    fbq?: MetaPixelFunction;
    _fbq?: MetaPixelFunction;
  }
}

type MetaPixelFunction = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  push?: MetaPixelFunction;
};

const EXCLUDED_PATH_PREFIXES = ["/admin"] as const;

const rawPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";
const META_PIXEL_ID = /^\d{5,20}$/.test(rawPixelId) ? rawPixelId : "";

export type MetaLeadSource =
  | "navbar_quote"
  | "hero_quote"
  | "contato_quote"
  | "whatsapp_fab"
  | "package_whatsapp"
  | "footer_whatsapp"
  | "quick_action_whatsapp"
  | "support_whatsapp"
  | "faq_whatsapp"
  | "final_cta"
  | "content_cta"
  | "other";

export type MetaLeadParams = {
  content_name?: string;
  content_category?: string;
  source?: MetaLeadSource;
};

export type MetaViewContentParams = {
  content_name: string;
  content_ids?: string[];
  content_type?: string;
};

export type MetaSearchParams = {
  search_string: string;
  content_category?: string;
};

export function getMetaPixelId(): string {
  return META_PIXEL_ID;
}

export function isMetaPixelConfigured(): boolean {
  return META_PIXEL_ID.length > 0;
}

export function isMetaPixelEnabled(): boolean {
  return isMetaPixelConfigured() && hasMetaPixelConsent();
}

export function isWhatsAppUrl(url: string): boolean {
  try {
    const parsed = new URL(url, "https://example.com");
    return (
      parsed.hostname === "wa.me" ||
      parsed.hostname.endsWith(".whatsapp.com") ||
      parsed.protocol === "whatsapp:"
    );
  } catch {
    return url.includes("wa.me") || url.startsWith("whatsapp:");
  }
}

export function shouldTrackMetaPixelOnPath(pathname: string): boolean {
  return !EXCLUDED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function canTrack(): boolean {
  return typeof window !== "undefined" && isMetaPixelEnabled() && typeof window.fbq === "function";
}

function track(event: string, params?: Record<string, unknown>): void {
  if (!canTrack()) {
    return;
  }

  if (params) {
    window.fbq!("track", event, params);
    return;
  }

  window.fbq!("track", event);
}

export function trackMetaPageView(): void {
  track("PageView");
}

export function trackMetaLead(params?: MetaLeadParams): void {
  track("Lead", {
    content_name: params?.content_name ?? "WhatsApp Contact",
    content_category: params?.content_category ?? params?.source ?? "whatsapp",
  });
}

export function trackMetaLeadFromHref(
  href: string,
  params?: Omit<MetaLeadParams, "content_category">,
): void {
  if (!isWhatsAppUrl(href)) {
    return;
  }

  trackMetaLead(params);
}

export function trackMetaViewContent(params: MetaViewContentParams): void {
  track("ViewContent", {
    content_name: params.content_name,
    content_ids: params.content_ids,
    content_type: params.content_type ?? "product",
  });
}

/** Prepared for future search tracking — not wired to UI yet. */
export function trackMetaSearch(params: MetaSearchParams): void {
  track("Search", {
    search_string: params.search_string,
    content_category: params.content_category,
  });
}

export function buildMetaPixelInitScript(pixelId: string): string {
  return `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
`.trim();
}
