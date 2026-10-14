"use client";

import Link from "next/link";
import { useLocationContext } from "@/contexts/LocationContext";
import { resolveAdHref, type AdHeroBanner } from "@/lib/ads";
import { toLocationSlug } from "@/lib/seo-urls";

interface AdBannerProps {
  ad: AdHeroBanner;
  /** Box aspect when the ad has its own mobile creative, e.g. "aspect-[16/9] md:aspect-[4/1]". */
  aspectClass: string;
  /** Box aspect when it doesn't (mobile shows the desktop image), e.g. "aspect-[4/1]". */
  desktopOnlyAspectClass: string;
  className?: string;
  eager?: boolean;
}

/**
 * One clickable ad creative. The box keeps the slot's exact aspect ratio so
 * baked-in creative text is never cropped; the mobile creative swaps in below
 * md (the API already falls back to the desktop image when there is none).
 * Plain <img> so R2 URLs need no next/image remote-pattern config.
 */
export function AdBanner({ ad, aspectClass, desktopOnlyAspectClass, className = "", eager = false }: AdBannerProps) {
  const { location } = useLocationContext();
  const href = resolveAdHref(ad, toLocationSlug(location));
  const alt = ad.title || "Promotion";
  const hasMobile = !!ad.mobileImage && ad.mobileImage !== ad.desktopImage;
  return (
    <Link
      href={href}
      aria-label={alt}
      className={`relative! block! w-full! overflow-hidden! bg-gray-50! ${hasMobile ? aspectClass : desktopOnlyAspectClass} ${className}`}
    >
      <img
        src={ad.desktopImage}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        className={`${hasMobile ? "hidden! md:block!" : "block!"} absolute! inset-0! w-full! h-full! object-cover! select-none!`}
      />
      {hasMobile && (
        <img
          src={ad.mobileImage}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          className="md:hidden! absolute! inset-0! w-full! h-full! object-cover! select-none!"
        />
      )}
    </Link>
  );
}
