export function getPackageHighlightUrl(slug: string): string {
  return `/pacotes?destaque=${encodeURIComponent(slug)}#pacote-${encodeURIComponent(slug)}`;
}

export function getPackageAnchorId(slug: string): string {
  return `pacote-${slug}`;
}
