import { normalizeBlogImageUrl } from "@/lib/blog/image-url";
import { resolveStorageImageSrc } from "@/lib/storage/media-url";

export function resolvePublicImageSrc(src: string): string {
  if (src.startsWith("blob:") || src.startsWith("data:")) {
    return src;
  }

  return resolveStorageImageSrc(normalizeBlogImageUrl(src));
}

export function isOptimizableRemoteImage(src: string): boolean {
  try {
    const hostname = new URL(src).hostname;
    return (
      hostname === "images.unsplash.com" ||
      hostname.endsWith(".supabase.co") ||
      hostname.endsWith(".googleusercontent.com")
    );
  } catch {
    return false;
  }
}
