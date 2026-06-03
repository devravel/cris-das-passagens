"use client";

import type { KeyboardEvent } from "react";
import { motion } from "framer-motion";

import {
  PACKAGE_CATEGORIES,
  PACKAGE_CATEGORY_LABELS,
  type PackageCategoryValue,
} from "@/lib/package/constants";
import { motionEase } from "@/lib/motion";
import { cn } from "@/lib/utils";

type PackageCategoryToggleProps = {
  value: PackageCategoryValue;
  onChange: (value: PackageCategoryValue) => void;
  layoutId: string;
  panelId: string | readonly string[];
  className?: string;
  labelledBy?: string;
};

export function PackageCategoryToggle({
  value,
  onChange,
  layoutId,
  panelId,
  className,
  labelledBy,
}: PackageCategoryToggleProps) {
  const indicatorLayoutId = `${layoutId}-category-indicator`;
  const panelControls = typeof panelId === "string" ? panelId : panelId.join(" ");

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, category: PackageCategoryValue) {
    const currentIndex = PACKAGE_CATEGORIES.indexOf(category);

    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex =
        (currentIndex + direction + PACKAGE_CATEGORIES.length) % PACKAGE_CATEGORIES.length;
      onChange(PACKAGE_CATEGORIES[nextIndex]!);
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      onChange(PACKAGE_CATEGORIES[0]!);
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      onChange(PACKAGE_CATEGORIES[PACKAGE_CATEGORIES.length - 1]!);
    }
  }

  return (
    <div
      role="tablist"
      aria-labelledby={labelledBy}
      className={cn(
        "relative flex w-full rounded-full border border-border/70 bg-muted/40 p-1 shadow-sm sm:inline-flex sm:w-auto",
        className,
      )}
    >
      {PACKAGE_CATEGORIES.map((category) => {
        const isActive = value === category;
        const tabId = `${layoutId}-tab-${category}`;

        return (
          <button
            key={category}
            id={tabId}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={panelControls}
            tabIndex={isActive ? 0 : -1}
            className={cn(
              "relative z-10 flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:min-w-[7.5rem] sm:flex-none sm:px-4",
              isActive ? "text-brand-foreground" : "text-muted-foreground hover:text-foreground",
            )}
            onClick={() => onChange(category)}
            onKeyDown={(event) => handleKeyDown(event, category)}
          >
            {isActive ? (
              <motion.span
                layoutId={indicatorLayoutId}
                className="absolute inset-0 rounded-full bg-brand shadow-sm motion-reduce:transition-none"
                transition={{ duration: 0.28, ease: motionEase }}
                aria-hidden
              />
            ) : null}
            <span className="relative z-10">{PACKAGE_CATEGORY_LABELS[category]}</span>
          </button>
        );
      })}
    </div>
  );
}
