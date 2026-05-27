export const STORAGE_MEDIA_BUCKETS = new Set(["package-images", "promotion-images", "blog-covers"]);

export function parseSupabasePublicStorageUrl(url: string): { bucket: string; path: string } | null {
  try {
    const parsed = new URL(url.trim());

    if (!parsed.hostname.endsWith(".supabase.co")) {
      return null;
    }

    const match = parsed.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);

    if (!match) {
      return null;
    }

    const bucket = decodeURIComponent(match[1]);
    const path = decodeURIComponent(match[2]);

    if (!STORAGE_MEDIA_BUCKETS.has(bucket) || !path || path.includes("..")) {
      return null;
    }

    return { bucket, path };
  } catch {
    return null;
  }
}

export function getStorageMediaProxyPath(url: string): string | null {
  const parsed = parseSupabasePublicStorageUrl(url);

  if (!parsed) {
    return null;
  }

  const encodedPath = parsed.path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `/api/media/${encodeURIComponent(parsed.bucket)}/${encodedPath}`;
}

export function resolveStorageImageSrc(url: string): string {
  const proxyPath = getStorageMediaProxyPath(url);
  return proxyPath ?? url;
}
