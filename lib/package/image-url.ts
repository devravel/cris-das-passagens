import { normalizeBlogImageUrl } from "@/lib/blog/image-url";

export function normalizePackageImageUrl(url: string | null | undefined): string {
  return normalizeBlogImageUrl(url);
}
