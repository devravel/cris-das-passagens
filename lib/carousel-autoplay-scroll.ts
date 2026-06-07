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

function isAutoplayTransformActive(content: HTMLElement | null) {
  const transform = content?.style.transform;
  return Boolean(transform && transform !== "none");
}

/** RAF autoplay: scrollLeft + fallback translate3d quando o scroll programático não aplica. */
export function applyAutoplayScrollOffset(
  scroller: HTMLElement,
  content: HTMLElement | null,
  left: number,
) {
  const before = scroller.scrollLeft;
  setHorizontalScrollPosition(scroller, left);

  const after = scroller.scrollLeft;
  const reachedTarget = Math.abs(after - left) <= 1;
  const scrollMoved =
    Math.abs(after - before) > 0.01 || Math.abs(before - left) <= 1;

  if (reachedTarget && scrollMoved) {
    clearAutoplayScrollTransform(content);
    return;
  }

  content?.style.setProperty("transform", `translate3d(${-left}px, 0, 0)`);
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
  if (isAutoplayTransformActive(content)) {
    return virtualLeft;
  }

  return scroller.scrollLeft;
}

/** Avança o offset do autoplay e aplica scroll nativo ou transform conforme necessário. */
export function advanceAutoplayScrollOffset(
  scroller: HTMLElement,
  content: HTMLElement | null,
  virtualLeft: number,
  deltaPx: number,
  loopSegment: number,
): number {
  const current = readAutoplayScrollOffset(scroller, content, virtualLeft);
  let next = current + deltaPx;

  if (loopSegment > 0) {
    while (next >= loopSegment) {
      next -= loopSegment;
    }
  }

  applyAutoplayScrollOffset(scroller, content, next);
  return next;
}
