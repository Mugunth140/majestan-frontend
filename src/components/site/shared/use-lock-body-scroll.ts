"use client";

import { useEffect } from "react";

/**
 * Hold the page still behind a modal. Restores whatever overflow the page
 * had when the last locker unmounts. Dialogs on this site never stack, so
 * a plain save/restore is enough — no ref counting.
 */
export function useLockBodyScroll(active = true): void {
  useEffect(() => {
    if (!active) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [active]);
}
