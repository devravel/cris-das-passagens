"use client";

import { useEffect, useState } from "react";

/**
 * Subscribe to a CSS media query. Uses `ssrDefault` on the server and for the
 * first client render to avoid hydration mismatch, then syncs in an effect.
 */
export function useMediaQuery(query: string, ssrDefault = false): boolean {
  const [matches, setMatches] = useState(ssrDefault);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const onChange = () => {
      setMatches(mediaQuery.matches);
    };

    mediaQuery.addEventListener("change", onChange);

    return () => {
      mediaQuery.removeEventListener("change", onChange);
    };
  }, [query]);

  return matches;
}
