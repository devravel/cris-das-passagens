import { normalizeBlogImageUrl } from "@/lib/blog/image-url";
import { absoluteUrl } from "@/lib/seo/site-url";
import { resolveStorageImageSrc } from "@/lib/storage/media-url";

export function resolvePublicOgImageUrl(imageUrl: string): string {
  const resolved = resolveStorageImageSrc(normalizeBlogImageUrl(imageUrl));
  return absoluteUrl(resolved);
}
