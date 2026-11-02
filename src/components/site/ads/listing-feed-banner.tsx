"use client";

import type { AdHeroBanner } from "@/lib/ads";
import { AdBanner } from "./ad-banner";

export function ListingFeedBanner({ ad }: { ad: AdHeroBanner }) {
  return (
    <AdBanner
      ad={ad}
      aspectClass="aspect-[4/5] md:aspect-[3/1]"
      desktopOnlyAspectClass="aspect-[3/1]"
      className="rounded-xl! border! border-gray-100!"
    />
  );
}
