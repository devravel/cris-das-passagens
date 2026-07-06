import { buildCanonicalUrl } from "@/lib/seo/site-url";

export function getPackageHighlightPath(slug: string): string {
  return `/pacotes?destaque=${encodeURIComponent(slug)}#pacote-${encodeURIComponent(slug)}`;
}

export function getPackageHighlightUrl(slug: string): string {
  return getPackageHighlightPath(slug);
}

export function getPackageShareUrl(slug: string): string {
  return buildCanonicalUrl(getPackageHighlightPath(slug));
}

export function buildPackageShareText(title: string, slug: string): string {
  return `${title} ${getPackageShareUrl(slug)}`;
}

export function getPackageAnchorId(slug: string): string {
  return `pacote-${slug}`;
}
