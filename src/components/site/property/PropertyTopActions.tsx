// site/majestan-frontend/src/components/site/property/PropertyTopActions.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronLeft, Share2 } from "lucide-react";
import { PROPERTY_TYPES } from "@/lib/seo-urls";
import { WishlistButton } from "@/components/site/wishlist/WishlistButton";
import { type SeoProperty } from "@/lib/api/property-by-slug";

type PropertyTopActionsProps = {
  property: SeoProperty;
};

/**
 * Back-to-listings + Share + Save bar. Shared verbatim by the overview and
 * every sub-page so the actions sit in the same place everywhere.
 */
export function PropertyTopActions({ property }: PropertyTopActionsProps) {
  const [copied, setCopied] = useState(false);

  const title = property.seo?.seoData?.overview?.h1 || property.title;
  const listingType = property.status.toLowerCase().includes("rent")
    ? "for-rent"
    : "for-sale";
  const propertyTypeSlug =
    Object.entries(PROPERTY_TYPES).find(
      ([, data]) => data.apiValue === property.propertyType
    )?.[0] || property.propertyType;

  const handleShare = async () => {
    const url = `${window.location.origin}/${property.canonicalSlug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* user dismissed */
    }
  };

  return (
    <div className="flex! flex-row! justify-between! items-center! gap-3!">
      <Link
        href={`/${listingType}/${propertyTypeSlug}/${property.city.toLowerCase()}`}
        className="inline-flex! items-center! gap-2! text-sm! font-medium! text-gray-500! hover:text-[#1645bf]! transition-colors! duration-200! ease-out-quint! no-underline! rounded-sm! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#1645bf]! focus-visible:ring-offset-4!"
      >
        <ChevronLeft className="w-4! h-4!" />
        Back to listings
      </Link>

      <div className="flex! items-center! gap-2!">
        <button
          onClick={handleShare}
          className="inline-flex! items-center! gap-2! px-5! py-2! rounded-xl! border! border-gray-200! bg-white! text-sm! font-medium! text-gray-600! hover:border-gray-300! hover:text-gray-900! transition-colors! duration-200! ease-out-quint! shadow-sm! cursor-pointer! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#1645bf]! focus-visible:ring-offset-2! active:scale-[0.98]!"
        >
          {copied ? <Check className="w-4! h-4! text-green-600!" /> : <Share2 className="w-4! h-4!" />}
          {copied ? "Copied" : "Share"}
        </button>
        <WishlistButton propertyId={property.id} propertyType={property.propertyType} variant="pill" />
      </div>
    </div>
  );
}
