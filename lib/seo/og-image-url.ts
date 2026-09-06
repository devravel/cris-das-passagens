import { normalizeBlogImageUrl } from "@/lib/blog/image-url";
import { absoluteUrl, buildCanonicalUrl } from "@/lib/seo/site-url";
import { resolveStorageImageSrc } from "@/lib/storage/media-url";

export function resolvePublicOgImageUrl(imageUrl: string): string {
  const resolved = resolveStorageImageSrc(normalizeBlogImageUrl(imageUrl));
  return absoluteUrl(resolved);
}

/**
 * URL absoluta da OG image gerada dinamicamente em /api/og/blog.
 * Sempre 1200×630 em JPEG leve, com a capa do post como fundo.
 */
export function getBlogOgImageUrl(slug: string): string {
  return buildCanonicalUrl(`/api/og/blog?slug=${encodeURIComponent(slug)}`);
}
