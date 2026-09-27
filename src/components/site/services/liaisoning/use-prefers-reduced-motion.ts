"use client";

import { useCallback, useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Reads `prefers-reduced-motion` in a hydration-safe way.
 *
 * `useReducedMotion` from motion/react looks like the obvious choice and is a
 * hydration bug here: it reports `false` on the server and the real value on the
 * first client render. Every call site on this page uses that value to pick a
 * *different DOM tree* (JS rail vs native scroll-snap, animated vs plain
 * wrapper), so the two trees disagree and React throws
 * "Hydration failed because the server rendered HTML didn't match the client".
 *
 * `useSyncExternalStore` is the sanctioned way to read a browser-only value: the
 * third argument is the server snapshot, so server and first client render both
 * see `false` and agree. The real value arrives on the next commit, which swaps
 * the tree once, after hydration has already succeeded. The first paint is
 * identical either way — the rail's resting state is a plain static row of
 * cards — so the switch is not visible.
 *
 * Note this is the *media query* only. The other two signals the design system
 * responds to (`prefers-reduced-transparency`, `prefers-contrast`) are pure CSS
 * and are handled in globals.css, with no hydration concern.
 */
export function usePrefersReducedMotion(): boolean {
  const subscribe = useCallback((onChange: () => void) => {
    if (typeof window === "undefined" || !window.matchMedia) return () => {};
    const list = window.matchMedia(QUERY);
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, []);

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(QUERY).matches;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
