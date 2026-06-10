"use client";

import { useEffect, useRef, type KeyboardEvent, type MouseEvent } from "react";

import { cn } from "@/lib/utils";

export type PackageTypeNavItem = {
  label: string;
  sectionId: string;
};

type PackageTypeNavProps = {
  items: PackageTypeNavItem[];
  activeSectionId: string;
  onNavigate: (sectionId: string) => void;
  className?: string;
  labelledBy?: string;
};

export function PackageTypeNav({
  items,
  activeSectionId,
  onNavigate,
  className,
  labelledBy,
}: PackageTypeNavProps) {
  const activeLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    activeLinkRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeSectionId]);

  function handleClick(event: MouseEvent<HTMLAnchorElement>, sectionId: string) {
    event.preventDefault();
    onNavigate(sectionId);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLAnchorElement>, index: number) {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (index + direction + items.length) % items.length;
      onNavigate(items[nextIndex]!.sectionId);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      onNavigate(items[0]!.sectionId);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      onNavigate(items[items.length - 1]!.sectionId);
    }
  }

  return (
    <nav aria-label="Tipos de pacote" className={cn("w-full min-w-0", className)}>
      <div className="overflow-x-auto overscroll-x-contain scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <ul
          aria-labelledby={labelledBy}
          className="flex min-w-max list-none items-center gap-x-1 gap-y-2 p-0 px-0.5 py-0.5 sm:mx-auto sm:min-w-0 sm:max-w-4xl sm:flex-wrap sm:justify-center sm:gap-x-2 lg:max-w-5xl"
        >
          {items.map((item, index) => {
            const isActive = activeSectionId === item.sectionId;

            return (
              <li key={item.sectionId}>
                <a
                  ref={isActive ? activeLinkRef : undefined}
                  href={`#${item.sectionId}`}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "group relative inline-flex shrink-0 px-2.5 py-2 text-sm font-medium tracking-tight transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:px-3 sm:text-[0.9375rem]",
                    isActive
                      ? "text-foreground"
                      : "text-foreground/60 hover:text-foreground",
                  )}
                  onClick={(event) => handleClick(event, item.sectionId)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                >
                  <span className="relative z-10 whitespace-nowrap">{item.label}</span>
                  <span
                    className={cn(
                      "pointer-events-none absolute inset-x-2.5 -bottom-0.5 h-px origin-left scale-x-0 bg-foreground transition-transform duration-200 ease-out sm:inset-x-3",
                      isActive && "scale-x-100",
                      !isActive && "group-hover:scale-x-100",
                    )}
                    aria-hidden
                  />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
