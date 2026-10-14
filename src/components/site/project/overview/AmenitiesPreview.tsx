"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { ProjectDetail } from "@/lib/api/projects";
import { RequestButton } from "@/components/site/project/RequestButton";
import { amenityGroups, amenityList } from "@/components/site/project/overview/amenity-parts";
import {
  FOCUS_RING,
  INK,
  IconMark,
  Panel,
  PanelEmpty,
  PanelLink,
  chipClass,
  swapClass,
} from "@/components/site/project/overview/overview-ui";

/** Two rows at the widest grid. */
const PREVIEW_COUNT = 8;
const ALL = "All";

/**
 * Overview preview of the amenities. The category chips filter the grid in
 * place, so a buyer checking for, say, security sees just that; the full,
 * grouped list is on the amenities page.
 */
export function AmenitiesPreview({ project }: { project: ProjectDetail }) {
  const [category, setCategory] = useState(ALL);
  const items = amenityList(project);
  const count = items.length;
  const slug = project.canonicalSlug;

  if (count === 0) {
    return (
      <Panel title="Amenities" id="amenities">
        <PanelEmpty
          icon={Sparkles}
          title="Amenities aren't listed yet"
          body="Ask for the full list of shared facilities and services."
          action={
            <RequestButton
              label="Request amenity list"
              message={`Please share the full amenity list for ${project.name}.`}
            />
          }
        />
      </Panel>
    );
  }

  const groups = amenityGroups(items);
  const pool = category === ALL ? items : (groups.find(([title]) => title === category)?.[1] ?? items);
  // Past eight, the last slot becomes the way to the rest rather than a ninth item.
  const overflow = pool.length > PREVIEW_COUNT;
  const shown = overflow ? pool.slice(0, PREVIEW_COUNT - 1) : pool;

  return (
    <Panel
      title="Amenities"
      id="amenities"
      meta={`${count} ${count === 1 ? "amenity" : "amenities"}${groups.length > 1 ? ` in ${groups.length} categories` : ""}`}
      action={
        <PanelLink href={`/${slug}/amenities`}>
          {count > PREVIEW_COUNT ? `View all ${count}` : "View all"}
        </PanelLink>
      }
    >
      {groups.length > 1 && (
        <div role="group" aria-label="Filter amenities" className="hide-scrollbar mt-5! -mx-1! flex! gap-2! overflow-x-auto! px-1! py-1! pr-8! [mask-image:linear-gradient(to_right,#000_calc(100%-2rem),transparent)]!">
          {[[ALL, items] as const, ...groups].map(([title, list]) => {
            const selected = category === title;
            return (
              <button
                key={title}
                type="button"
                aria-pressed={selected}
                onClick={() => setCategory(title)}
                className={chipClass(selected)}
              >
                {title}
                <span className={`tabular-nums! ${selected ? "text-[var(--ov-blue)]!" : "text-[var(--ov-muted)]!"}`}>
                  {list.length}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <ul
        key={category}
        className={`${swapClass} m-0! mt-6! p-0! list-none! grid! grid-cols-2! sm:grid-cols-3! lg:grid-cols-4! gap-x-4! gap-y-5!`}
      >
        {shown.map((item) => (
          <li key={item.key} className="flex! items-center! gap-3! min-w-0!">
            <IconMark Icon={item.Icon} />
            <span className={`min-w-0! text-sm! font-medium! leading-snug! text-pretty! break-words! ${INK}`}>
              {item.name}
            </span>
          </li>
        ))}
        {overflow && (
          <li className="min-w-0!">
            <Link
              href={`/${slug}/amenities`}
              className={`group/more flex! items-center! gap-3! rounded-xl! no-underline! ${FOCUS_RING}`}
            >
              <span className="grid! w-11! h-11! shrink-0! place-items-center! rounded-xl! bg-[var(--ov-sky)]! text-sm! font-semibold! text-[var(--ov-blue-deep)]! tabular-nums! transition-colors! duration-150! group-hover/more:bg-[var(--ov-sky-2)]!">
                +{pool.length - shown.length}
              </span>
              <span className="text-sm! font-semibold! text-[var(--ov-blue-deep)]! underline! decoration-[#bcd0f7]! underline-offset-4! group-hover/more:decoration-[var(--ov-blue-deep)]!">more amenities</span>
            </Link>
          </li>
        )}
      </ul>
    </Panel>
  );
}
