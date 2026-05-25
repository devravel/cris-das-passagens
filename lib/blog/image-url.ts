export const BLOG_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80";

const ALLOWED_IMAGE_PROTOCOLS = new Set(["http:", "https:"]);

export function normalizeBlogImageUrl(url: string | null | undefined): string {
  const trimmed = url?.trim();

  if (!trimmed) {
    return BLOG_IMAGE_FALLBACK;
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);

    if (!ALLOWED_IMAGE_PROTOCOLS.has(parsed.protocol)) {
      return BLOG_IMAGE_FALLBACK;
    }

    return parsed.toString();
  } catch {
    return BLOG_IMAGE_FALLBACK;
  }
}

export function isValidBlogImageUrl(url: string): boolean {
  const trimmed = url.trim();

  if (trimmed.startsWith("/api/media/")) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    return ALLOWED_IMAGE_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

export function isSupabaseStorageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith(".supabase.co") && parsed.pathname.includes("/storage/v1/object/public/");
  } catch {
    return false;
  }
}
