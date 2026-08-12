"use client";

import {
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

type InfiniteDragMarqueeProps = {
  children: ReactNode;
  /** px por segundo — lento ≈ 20–40 */
  speed?: number;
  className?: string;
  gapClassName?: string;
  ariaLabel?: string;
  /** Quando false, para no primeiro e no último item em vez de circular. */
  loop?: boolean;
};

const DRAG_CLICK_SUPPRESS_PX = 6;

const INTERACTIVE_SELECTOR = [
  "a",
  "button",
  "input",
  "textarea",
  "select",
  "label",
  "summary",
  '[role="button"]',
  '[role="link"]',
  '[role="menuitem"]',
  '[role="tab"]',
  '[contenteditable="true"]',
].join(",");

function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(INTERACTIVE_SELECTOR));
}

export function InfiniteDragMarquee({
  children,
  speed = 28,
  className,
  gapClassName = "gap-3 pr-3",
  ariaLabel,
  loop = true,
}: InfiniteDragMarqueeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const offsetRef = useRef(0);
  const halfRef = useRef(0);
  const maxOffsetRef = useRef(0);
  const loopRef = useRef(loop);
  loopRef.current = loop;
  const draggingRef = useRef(false);
  const hoveredRef = useRef(false);
  const contactRef = useRef(false);
  const movedRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const startOffsetRef = useRef(0);
  const lastTsRef = useRef(0);
  const rafRef = useRef(0);
  const releaseListenersRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    reducedMotionRef.current = reduced;
    if (reduced) return;

    const measure = () => {
      if (loopRef.current) {
        halfRef.current = track.scrollWidth / 2;
        return;
      }
      maxOffsetRef.current = Math.max(0, track.scrollWidth - root.clientWidth);
    };

    const wrap = () => {
      if (loopRef.current) {
        const half = halfRef.current;
        if (half <= 0) return;
        offsetRef.current = ((offsetRef.current % half) + half) % half;
        return;
      }
      offsetRef.current = Math.min(
        maxOffsetRef.current,
        Math.max(0, offsetRef.current),
      );
    };

    const apply = () => {
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
    };

    const isPaused = () =>
      hoveredRef.current || contactRef.current || draggingRef.current;

    const tick = (ts: number) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      const canAdvance = loopRef.current
        ? halfRef.current > 0
        : maxOffsetRef.current > 0 &&
          offsetRef.current < maxOffsetRef.current;

      if (!isPaused() && canAdvance) {
        offsetRef.current += speed * dt;
        wrap();
        apply();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    measure();
    apply();
    rafRef.current = requestAnimationFrame(tick);

    const ro = new ResizeObserver(() => {
      if (loopRef.current) {
        const before = halfRef.current;
        measure();
        if (before > 0 && halfRef.current > 0) {
          offsetRef.current =
            (offsetRef.current / before) * halfRef.current;
        }
      } else {
        measure();
      }
      wrap();
      apply();
    });
    ro.observe(track);
    if (!loopRef.current) ro.observe(root);

    const imgs = track.querySelectorAll("img");
    const onImgLoad = () => {
      measure();
      wrap();
      apply();
    };
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener("load", onImgLoad);
    });

    const onVisibilityChange = () => {
      if (!document.hidden) {
        lastTsRef.current = 0;
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      imgs.forEach((img) => img.removeEventListener("load", onImgLoad));
      releaseListenersRef.current?.();
    };
  }, [speed, loop]);

  const endPointerContact = (
    e: { pointerId: number },
    root: HTMLDivElement,
  ) => {
    if (e.pointerId !== pointerIdRef.current) return;

    releaseListenersRef.current?.();

    const didDrag = draggingRef.current && movedRef.current;

    pointerIdRef.current = null;
    draggingRef.current = false;
    contactRef.current = false;
    lastTsRef.current = 0;
    root.classList.remove("is-dragging");

    if (didDrag) {
      const suppressClick = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
      };

      root.addEventListener("click", suppressClick, {
        capture: true,
        once: true,
      });
    }
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reducedMotionRef.current) return;
    if (pointerIdRef.current !== null) return;

    const root = e.currentTarget;
    pointerIdRef.current = e.pointerId;
    contactRef.current = true;
    movedRef.current = false;
    lastTsRef.current = 0;

    if (isInteractiveTarget(e.target)) {
      draggingRef.current = false;

      const onWindowPointerUp = (event: PointerEvent) => {
        endPointerContact(event, root);
      };

      releaseListenersRef.current?.();
      releaseListenersRef.current = () => {
        window.removeEventListener("pointerup", onWindowPointerUp);
        window.removeEventListener("pointercancel", onWindowPointerUp);
        releaseListenersRef.current = null;
      };

      window.addEventListener("pointerup", onWindowPointerUp);
      window.addEventListener("pointercancel", onWindowPointerUp);
      return;
    }

    draggingRef.current = true;
    startXRef.current = e.clientX;
    startOffsetRef.current = offsetRef.current;
    root.setPointerCapture(e.pointerId);
    root.classList.add("is-dragging");
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || e.pointerId !== pointerIdRef.current) return;

    const dx = e.clientX - startXRef.current;
    if (Math.abs(dx) >= DRAG_CLICK_SUPPRESS_PX) {
      movedRef.current = true;
    }

    offsetRef.current = startOffsetRef.current - dx;

    if (loopRef.current) {
      const half = halfRef.current;
      if (half > 0) {
        offsetRef.current = ((offsetRef.current % half) + half) % half;
      }
    } else {
      offsetRef.current = Math.min(
        maxOffsetRef.current,
        Math.max(0, offsetRef.current),
      );
    }

    const track = trackRef.current;
    if (track) {
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
    }
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    endPointerContact(e, e.currentTarget);
  };

  const onPointerEnter = () => {
    if (reducedMotionRef.current) return;
    hoveredRef.current = true;
    lastTsRef.current = 0;
  };

  const onPointerLeave = () => {
    hoveredRef.current = false;
    lastTsRef.current = 0;
  };

  return (
    <div
      ref={rootRef}
      className={cn(
        "infinite-drag-marquee w-full cursor-grab overflow-hidden touch-none select-none",
        "motion-reduce:cursor-default motion-reduce:touch-pan-y",
        className,
      )}
      role="region"
      aria-label={ariaLabel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div
        ref={trackRef}
        className="infinite-drag-marquee-track flex w-max flex-nowrap will-change-transform motion-reduce:!transform-none motion-reduce:w-full"
      >
        <div
          className={cn(
            "infinite-drag-marquee-group flex shrink-0 flex-nowrap",
            gapClassName,
          )}
        >
          {children}
        </div>
        {loop ? (
          <div
            className={cn(
              "infinite-drag-marquee-group flex shrink-0 flex-nowrap motion-reduce:hidden",
              gapClassName,
            )}
            aria-hidden
            inert
          >
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}
