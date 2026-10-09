"use client";

import { useEffect, useState } from "react";

/**
 * Progressive listing photo with a cached type placeholder.
 *
 * The placeholder renders instantly (it is tiny and cached after the first
 * load), the real photo fades in over it once decoded, and any load failure
 * settles back on the placeholder. A session-level prefetch map deduplicates
 * parallel requests for the same URL across cards (back-nav, pagination,
 * wishlist ↔ listing) so each photo is fetched at most once per session —
 * repeat views resolve from the browser HTTP cache.
 *
 * The wrapper is `display: contents`, so both images participate in the
 * parent layout exactly like the single <img> this replaces (absolute
 * positioning, aspect boxes, group-hover zoom all keep working).
 */

// Session-level cache: each distinct real URL is prefetched at most once.
const pendingLoads = new Map<string, Promise<void>>();

function prefetchReal(src: string): Promise<void> {
  const existing = pendingLoads.get(src);
  if (existing) return existing;
  const promise = new Promise<void>((resolve) => {
    if (typeof window === "undefined" || typeof window.Image === "undefined") {
      resolve();
      return;
    }
    const probe = new window.Image();
    probe.onload = () => resolve();
    // Resolve (don't reject) on failure — the <img> onError below decides
    // the visual outcome; the cache just records "attempted".
    probe.onerror = () => resolve();
    probe.src = src;
  });
  pendingLoads.set(src, promise);
  return promise;
}

type ListingImageProps = {
  /** Real photo URL. Null/empty renders the placeholder only. */
  src: string | null | undefined;
  /** Instant type placeholder shown until the real photo is ready. */
  placeholderSrc: string;
  alt: string;
  /** Layout classes shared by both images (positioning, object-fit, zoom). */
  className?: string;
  /** Render the real photo eagerly with high fetch priority (first card). */
  eager?: boolean;
  "aria-label"?: string;
};

export function ListingImage({
  src,
  placeholderSrc,
  alt,
  className,
  eager = false,
  ...rest
}: ListingImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  // Reset on src change during render (React-endorsed pattern — no effect).
  if (prevSrc !== src) {
    setPrevSrc(src);
    setLoaded(false);
    setFailed(false);
  }

  useEffect(() => {
    // Warm the session cache; the visible swap still waits for this
    // instance's own onLoad so the fade never plays over a broken image.
    if (src) void prefetchReal(src);
  }, [src]);

  const showReal = Boolean(src) && !failed;

  return (
    <span className="contents">
      {!loaded && (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          draggable={false}
          className={`${className ?? ""} blur-[2px] scale-105`}
        />
      )}
      {showReal && (
        <img
          src={src as string}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          decoding="async"
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={(e) => {
            // One-shot guard: a broken placeholder must not ping-pong.
            const el = e.currentTarget;
            if (el.dataset.listingFallback === "1") return;
            el.dataset.listingFallback = "1";
            setFailed(true);
          }}
          className={`${className ?? ""} transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          {...rest}
        />
      )}
    </span>
  );
}
