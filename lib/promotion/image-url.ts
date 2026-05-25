import { normalizeBlogImageUrl } from "@/lib/blog/image-url";

export function normalizePromotionImageUrl(url: string | null | undefined): string {
  return normalizeBlogImageUrl(url);
}
