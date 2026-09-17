"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { getLocalityOverviews, matchLocality } from "@/lib/api/localities";
import type { Sublocation } from "@/lib/api";

type Props = {
  /** Locality name as shown on the detail page (e.g. "Saravanampatti"). */
  locality: string;
  city?: string;
  /** Backlink to this listing's locality sub-page (e.g. `/{slug}/locality`). */
  localityHref: string;
};

/**
 * "About {locality}" teaser: pulls the editorial overview written in
 * Admin → Sublocations and backlinks to the locality sub-page.
 * Renders nothing when no matching description exists.
 */
export function LocalityTeaser({ locality, city, localityHref }: Props) {
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
    <div className="bg-white! rounded-[20px]! border! border-gray-200/70! p-6! md:p-8! shadow-sm!">
      <div className="flex! items-center! gap-3!">
        <h2 className="text-lg! md:text-xl! font-normal! text-gray-900!">
          About {match.sublocation}
        </h2>
      </div>
      <p className="mt-4! text-gray-500! font-normal! leading-relaxed! line-clamp-3!">
        {match.description.trim()}
      </p>
      <Link
        href={localityHref}
        className="mt-4! inline-flex! items-center! gap-2! text-sm! font-medium! text-[#27427f]! hover:text-[#1a2d59]! transition-colors! no-underline!"
      >
        View locality guide
      </Link>
    </div>
  );
}
