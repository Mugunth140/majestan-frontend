"use client";

import { useEffect, useRef } from "react";

/** Navbar (64px) plus the sticky section tabs (45px): the band above content. */
const STICKY_CHROME_PX = 109;

/**
 * Sticky at the vertical centre of the visible band, but only once it gets
 * there. Until then it scrolls with the page, so it starts level with the
 * first section beside it instead of hovering somewhere below it.
 *
 * CSS can't centre a sticky element of unknown height, so this measures the
 * element and writes the centring offset into `--sticky-top`, the property
 * the `top` utility reads. It writes the style directly rather than through
 * state: a resize shouldn't re-render the enquiry form inside it. Before
 * hydration the class's fallback keeps it just below the tabs.
 */
export function StickyCenter({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      el.style.setProperty(
        "--sticky-top",
        `calc(${STICKY_CHROME_PX}px + max(16px, (100svh - ${STICKY_CHROME_PX}px - ${el.offsetHeight}px) / 2))`,
      );
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`lg:sticky! lg:top-[var(--sticky-top,125px)]! ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
