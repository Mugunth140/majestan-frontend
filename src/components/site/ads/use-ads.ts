"use client";

import { useEffect, useState } from "react";
import { getAdsBannersCached, type AdHeroBanner, type AdPlacement } from "@/lib/ads";

/** Active ads for a placement, fetched once per page load. Empty until loaded. */
export function useAds(placement: AdPlacement, enabled = true): AdHeroBanner[] {
  const [ads, setAds] = useState<AdHeroBanner[]>([]);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    getAdsBannersCached(placement).then((items) => {
      if (alive) setAds(items);
    });
    return () => {
      alive = false;
    };
  }, [placement, enabled]);
  return ads;
}
