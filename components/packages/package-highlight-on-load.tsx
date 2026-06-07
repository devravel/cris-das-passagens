"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { trackMetaViewContent } from "@/lib/meta-pixel";
import { getPackageAnchorId } from "@/lib/package/routes";

export function PackageHighlightOnLoad() {
  const searchParams = useSearchParams();
  const highlightSlug = searchParams.get("destaque");

  useEffect(() => {
    if (!highlightSlug) {
      return;
    }

    let cleanupTimer: number | undefined;

    const highlightTarget = () => {
      const target = document.getElementById(getPackageAnchorId(highlightSlug));

      if (!target) {
        return false;
      }

      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.dataset.highlighted = "true";

      if (target instanceof HTMLElement) {
        target.focus({ preventScroll: true });
      }

      cleanupTimer = window.setTimeout(() => {
        delete target.dataset.highlighted;
      }, 3200);

      return true;
    };

    trackMetaViewContent({
      content_name: highlightSlug,
      content_ids: [highlightSlug],
    });

    if (!highlightTarget()) {
      const retryTimer = window.setTimeout(highlightTarget, 350);

      return () => {
        window.clearTimeout(retryTimer);
        if (cleanupTimer) {
          window.clearTimeout(cleanupTimer);
        }
      };
    }

    return () => {
      if (cleanupTimer) {
        window.clearTimeout(cleanupTimer);
      }
    };
  }, [highlightSlug]);

  return null;
}
