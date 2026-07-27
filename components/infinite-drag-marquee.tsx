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
};

const DRAG_CLICK_SUPPRESS_PX = 6;

export function InfiniteDragMarquee({
  children,
  speed = 28,
  className,
  gapClassName = "gap-3 pr-3",
  ariaLabel,
}: InfiniteDragMarqueeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const offsetRef = useRef(0);
  const halfRef = useRef(0);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const startOffsetRef = useRef(0);
  const lastTsRef = useRef(0);
  const rafRef = useRef(0);

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
      halfRef.current = track.scrollWidth / 2;
    };

    const wrap = () => {
      const half = halfRef.current;
      if (half <= 0) return;
      offsetRef.current = ((offsetRef.current % half) + half) % half;
    };

    const apply = () => {
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
    };

    const tick = (ts: number) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      if (!draggingRef.current && halfRef.current > 0) {
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
      const before = halfRef.current;
      measure();
      if (before > 0 && halfRef.current > 0) {
        offsetRef.current =
          (offsetRef.current / before) * halfRef.current;
      }
      wrap();
      apply();
    });
    ro.observe(track);

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
    };
  }, [speed]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reducedMotionRef.current) return;
    if (pointerIdRef.current !== null) return;
    pointerIdRef.current = e.pointerId;
    draggingRef.current = true;
    movedRef.current = false;
    startXRef.current = e.clientX;
    startOffsetRef.current = offsetRef.current;
    lastTsRef.current = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.classList.add("is-dragging");
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || e.pointerId !== pointerIdRef.current) return;

    const dx = e.clientX - startXRef.current;
    if (Math.abs(dx) >= DRAG_CLICK_SUPPRESS_PX) {
      movedRef.current = true;
    }

    offsetRef.current = startOffsetRef.current - dx;

    const half = halfRef.current;
    if (half > 0) {
      offsetRef.current = ((offsetRef.current % half) + half) % half;
    }

    const track = trackRef.current;
    if (track) {
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
    }
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== pointerIdRef.current) return;
    pointerIdRef.current = null;
    draggingRef.current = false;
    lastTsRef.current = 0;
    e.currentTarget.classList.remove("is-dragging");

    if (movedRef.current) {
      const root = rootRef.current;
      if (!root) return;

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
        <div
          className={cn(
            "infinite-drag-marquee-group flex shrink-0 flex-nowrap motion-reduce:hidden",
            gapClassName,
          )}
          aria-hidden
        >
          {children}
        </div>
      </div>
    </div>
  );
}
