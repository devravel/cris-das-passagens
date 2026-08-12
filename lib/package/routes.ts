import { buildCanonicalUrl } from "@/lib/seo/site-url";

/**
 * Caminho canônico sem fragmento — usado em metadata (canonical, og:url).
 * Fragmentos nunca são enviados ao servidor por crawlers (WhatsApp, Google).
 */
export function getPackageHighlightPath(slug: string): string {
  return `/pacotes?destaque=${encodeURIComponent(slug)}`;
}

/**
 * URL absoluta da OG image gerada dinamicamente em /api/og/pacote.
 * Sempre retorna 1200×630 com a foto do pacote como fundo (cover).
 */
export function getPackageOgImageUrl(slug: string): string {
  return buildCanonicalUrl(`/api/og/pacote?slug=${encodeURIComponent(slug)}`);
}

/**
 * URL de navegação com fragmento — para o link "Mais detalhes" no cliente,
 * permite o scroll nativo do browser como fallback ao JS.
 */
export function getPackageHighlightUrl(slug: string): string {
  return `${getPackageHighlightPath(slug)}#pacote-${encodeURIComponent(slug)}`;
}

export function getPackageShareUrl(slug: string): string {
  return buildCanonicalUrl(getPackageHighlightUrl(slug));
}

export function buildPackageShareText(title: string, slug: string): string {
  return `${title} ${getPackageShareUrl(slug)}`;
}

export function getPackageAnchorId(slug: string): string {
  return `pacote-${slug}`;
}
