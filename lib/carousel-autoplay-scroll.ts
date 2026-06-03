/** Safari iOS / iPadOS — WebKit ignora scrollLeft em alguns contextos de overflow. */
export function isIOSWebKit() {
  if (typeof window === "undefined") {
    return false;
  }

  const { userAgent, platform, maxTouchPoints } = window.navigator;

  return (
    /iPad|iPhone|iPod/.test(userAgent) ||
    (platform === "MacIntel" && maxTouchPoints > 1)
  );
}

/** Aplica posição horizontal: scrollLeft + scrollTo no iOS para garantir movimento. */
export function setHorizontalScrollPosition(element: HTMLElement, left: number) {
  element.scrollLeft = left;

  if (isIOSWebKit()) {
    element.scrollTo({ left, behavior: "auto" });
  }
}

/** Dispositivo touch — hover/focus sintéticos do iOS não devem pausar autoplay. */
export function isCoarsePointerDevice() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(pointer: coarse)").matches;
}

export function clearAutoplayScrollTransform(content: HTMLElement | null) {
  content?.style.removeProperty("transform");
}

/** RAF autoplay: scrollLeft + fallback translate3d no iOS quando scroll não aplica. */
export function applyAutoplayScrollOffset(
  scroller: HTMLElement,
  content: HTMLElement | null,
  left: number,
) {
  setHorizontalScrollPosition(scroller, left);

  if (!isIOSWebKit() || !content) {
    clearAutoplayScrollTransform(content);
    return;
  }

  if (Math.abs(scroller.scrollLeft - left) <= 1) {
    clearAutoplayScrollTransform(content);
    return;
  }

  content.style.transform = `translate3d(${-left}px, 0, 0)`;
}

/** Antes de gesto manual: volta ao scroll nativo na posição visual atual. */
export function syncScrollerToAutoplayOffset(
  scroller: HTMLElement,
  content: HTMLElement | null,
  left: number,
) {
  clearAutoplayScrollTransform(content);
  setHorizontalScrollPosition(scroller, left);
}

export function readAutoplayScrollOffset(
  scroller: HTMLElement,
  content: HTMLElement | null,
  virtualLeft: number,
) {
  if (
    isIOSWebKit() &&
    content?.style.transform &&
    content.style.transform !== "none"
  ) {
    return virtualLeft;
  }

  return scroller.scrollLeft;
}
