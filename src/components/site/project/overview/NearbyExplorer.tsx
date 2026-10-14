"use client";

import { useState } from "react";
import { connectivityIconFor } from "@/components/site/project/connectivity-icons";
import type { NearbyCategory } from "@/components/site/project/overview/location-parts";
import {
  HAIRLINE,
  INK,
  MUTED,
  barClass,
  chipClass,
  swapClass,
} from "@/components/site/project/overview/overview-ui";

/** "1.4 km" → 1.4, "800 m" → 0.8. Anything else has no bar. */
function km(distance: string | null | undefined): number | null {
  const match = (distance ?? "").match(/([\d.]+)\s*(km|m)\b/i);
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return null;
  return match[2].toLowerCase() === "m" ? value / 1000 : value;
}

/**
 * Nearby places one category at a time, each with a bar for its distance,
 * scaled to the farthest place in the category. The bars make "how close"
 * readable at a glance rather than by comparing decimals.
 */
export function NearbyExplorer({
  categories,
  placesPerCategory,
}: {
  categories: NearbyCategory[];
  placesPerCategory: number;
}) {
  const [active, setActive] = useState(0);
  const category = categories[active] ?? categories[0];
  if (!category) return null;

  const all = category.places ?? [];
  const places = all.slice(0, placesPerCategory);
  const hidden = all.length - places.length;
  const farthest = Math.max(...places.map((place) => km(place.distance) ?? 0), 0);

  return (
    <div>
      <div role="tablist" aria-label="Nearby places" className="hide-scrollbar -mx-1! flex! gap-2! overflow-x-auto! px-1! py-1! pr-8! [mask-image:linear-gradient(to_right,#000_calc(100%-2rem),transparent)]!">
        {categories.map((cat, index) => {
          const Icon = connectivityIconFor(cat.icon);
          const selected = index === active;
          return (
            <button
              key={`${cat.title ?? ""}-${index}`}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(index)}
              className={chipClass(selected)}
            >
              <Icon className="w-4! h-4!" strokeWidth={1.75} aria-hidden="true" />
              {cat.title || "Nearby"}
            </button>
          );
        })}
      </div>

      <ul key={active} role="tabpanel" className={`${swapClass} m-0! mt-4! p-0! list-none! border-t! ${HAIRLINE}`}>
        {places.map((place, index) => {
          const distance = km(place.distance);
          const share = distance != null && farthest > 0 ? Math.max(distance / farthest, 0.04) : null;
          return (
            <li
              key={`${place.name}-${index}`}
              className={`grid! grid-cols-[minmax(0,1fr)_auto]! items-center! gap-x-4! gap-y-2! py-3.5! border-b! ${HAIRLINE} sm:grid-cols-[minmax(0,1fr)_minmax(0,9rem)_4.5rem]!`}
            >
              <span className={`min-w-0! truncate! text-sm! font-medium! ${INK}`} title={place.name}>
                {place.name}
              </span>
              <span className="hidden! sm:block! h-1.5! rounded-full! bg-[var(--ov-sky)]! overflow-hidden!" aria-hidden="true">
                {share != null && (
                  <span
                    className={`${barClass} block! h-full! rounded-full! bg-[linear-gradient(90deg,#60a5fa,#2563eb)]!`}
                    style={{ width: `${share * 100}%`, animationDelay: `${index * 40}ms` }}
                  />
                )}
              </span>
              <span className={`text-sm! text-right! tabular-nums! whitespace-nowrap! ${MUTED}`}>
                {place.distance}
              </span>
            </li>
          );
        })}
      </ul>
      {hidden > 0 && (
        <p className={`m-0! mt-3! text-[13px]! ${MUTED}`}>+{hidden} more on the locality page</p>
      )}
    </div>
  );
}
