/** Aceita link normal do YouTube (watch, youtu.be, shorts, embed) e devolve a URL de embed. */
export function toYouTubeEmbedUrl(url: string | null | undefined): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, "");
    let id: string | null = null;

    if (host === "youtu.be") {
      id = parsed.pathname.slice(1).split("/")[0] ?? null;
    } else if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      if (parsed.pathname === "/watch") id = parsed.searchParams.get("v");
      else {
        const match = parsed.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/);
        id = match?.[1] ?? null;
      }
    }

    return id && /^[\w-]{6,}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

/**
 * Aceita o `src` do "Incorporar um mapa" do Google Maps ou o link normal de um lugar.
 * Link normal vira embed por busca (sem chave de API).
 */
export function toGoogleMapsEmbedUrl(url: string | null | undefined): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "google.com" && parsed.pathname.startsWith("/maps/embed")) return parsed.toString();
    if (host === "maps.google.com" || (host === "google.com" && parsed.pathname.startsWith("/maps"))) {
      const place = parsed.pathname.match(/\/maps\/place\/([^/]+)/)?.[1] ?? parsed.searchParams.get("q");
      if (place) return `https://www.google.com/maps?q=${encodeURIComponent(decodeURIComponent(place))}&output=embed`;
    }
    if (host === "maps.app.goo.gl" || host === "goo.gl") return null; // link encurtado não dá pra embutir

    return null;
  } catch {
    return null;
  }
}
