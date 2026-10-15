"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CARD, HEADING, TEXT_LINK } from "@/components/site/project/project-ui";
import { getLocalityOverviews, matchLocality } from "@/lib/api/localities";
import type { Sublocation } from "@/lib/api";

type Props = {
  /** Locality name as shown on the detail page (e.g. "Saravanampatti"). */
  locality: string;
  city?: string;
  /** Backlink to this listing's locality sub-page (e.g. `/{slug}/locality`).
      Omit it to hide the link — used when the teaser IS the section. */
  localityHref?: string;
  /** Full variant: complete description, no clamp — for the locality page
      itself rather than the overview teaser slot. */
  full?: boolean;
};

/**
 * "About {locality}" teaser: pulls the editorial overview written in
 * Admin → Sublocations and backlinks to the locality sub-page.
 * Renders nothing when no matching description exists.
 */
export function LocalityTeaser({ locality, city, localityHref, full }: Props) {
  const [match, setMatch] = useState<Sublocation | null>(null);

  useEffect(() => {
    let cancelled = false;
    getLocalityOverviews()
      .then((list) => {
        if (!cancelled) setMatch(matchLocality(list, locality, city));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [locality, city]);

  if (!match || !match.description || !match.description.trim()) return null;

  return (
    <div className={CARD}>
      <div className="flex! items-center! gap-3!">
        <h2 className={HEADING}>
          About {match.sublocation}
        </h2>
      </div>
      <p className={`mt-4! text-gray-500! font-normal! leading-relaxed!${full ? "" : " line-clamp-3!"}`}>
        {match.description.trim()}
      </p>
      {localityHref && (
        <Link
          href={localityHref}
          className={`${TEXT_LINK} mt-4! inline-flex! items-center! gap-2! text-sm! font-semibold!`}
        >
          View locality guide
        </Link>
      )}
    </div>
  );
}
