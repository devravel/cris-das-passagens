export const STORAGE_MEDIA_BUCKETS = new Set(["package-images", "promotion-images", "blog-covers"]);

/** Cache longo em uploads imutáveis (timestamp + uuid no path). */
export const STORAGE_UPLOAD_CACHE_CONTROL = "31536000";

function getSupabaseProjectOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!raw) {
    return null;
  }

  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

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

export function getSupabasePublicObjectUrl(bucket: string, objectPath: string): string | null {
  const origin = getSupabaseProjectOrigin();

  if (!origin || !STORAGE_MEDIA_BUCKETS.has(bucket) || !objectPath || objectPath.includes("..")) {
    return null;
  }

  const encodedPath = objectPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${origin}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodedPath}`;
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

/** Converte URLs legadas do proxy para a URL pública direta do Supabase. */
export function unwrapMediaProxyPath(url: string): string | null {
  if (!url.startsWith("/api/media/")) {
    return null;
  }

  const remainder = url.slice("/api/media/".length);
  const slashIndex = remainder.indexOf("/");

  if (slashIndex === -1) {
    return null;
  }

  const bucket = decodeURIComponent(remainder.slice(0, slashIndex));
  const objectPath = remainder
    .slice(slashIndex + 1)
    .split("/")
    .map((segment) => decodeURIComponent(segment))
    .join("/");

  return getSupabasePublicObjectUrl(bucket, objectPath);
}

/**
 * Resolve a melhor URL para exibição pública.
 * Usa o CDN do Supabase diretamente para o next/image otimizar (AVIF/WebP + resize).
 */
export function resolveStorageImageSrc(url: string): string {
  const trimmed = url.trim();
  const fromProxy = unwrapMediaProxyPath(trimmed);

  if (fromProxy) {
    return fromProxy;
  }

  if (parseSupabasePublicStorageUrl(trimmed)) {
    return trimmed;
  }

  return trimmed;
}
