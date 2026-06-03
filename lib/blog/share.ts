export function isNativeShareAvailable(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

type ShareArticleOptions = {
  title: string;
  url: string;
  text?: string;
};

export async function shareArticleNative({
  title,
  url,
  text,
}: ShareArticleOptions): Promise<"shared" | "aborted" | "unavailable"> {
  if (!isNativeShareAvailable()) {
    return "unavailable";
  }

  try {
    await navigator.share({
      title,
      url,
      text: text ?? title,
    });
    return "shared";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return "aborted";
    }
    return "unavailable";
  }
}
