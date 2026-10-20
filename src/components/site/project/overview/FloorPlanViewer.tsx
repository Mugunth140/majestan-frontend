"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  FOCUS_RING,
  INK,
  MUTED,
  chipClass,
  swapClass,
} from "@/components/site/project/overview/overview-ui";

export type PlanPreview = {
  key: string;
  label: string;
  configuration: string;
  area: string | null;
  floorName: string;
  src: string;
  href: string;
  alt: string;
  titleText?: string;
  caption?: string;
};

const ALL = "All";
/* Two rows of the two-column grid. */
const SHOWN = 4;

/**
 * The plans as a grid of drawings, filterable by configuration. Each card is
 * the drawing on a soft sheet with its name beneath, and opens that plan on
 * the floor plans page. Filters appear only when there is more than one type.
 */
export function FloorPlanViewer({ plans }: { plans: PlanPreview[] }) {
  const [filter, setFilter] = useState(ALL);
  const types = [...new Set(plans.map((plan) => plan.label))];
  const pool =
    filter === ALL ? plans : plans.filter((plan) => plan.label === filter);
  const shown = pool.slice(0, SHOWN);
  const single = shown.length === 1;

  return (
    <div className="mt-5!">
      {types.length > 1 && (
        <div
          role="group"
          aria-label="Filter plans"
          className="hide-scrollbar -mx-1! mb-5! flex! gap-2! overflow-x-auto! px-1! py-1!"
        >
          {[ALL, ...types].map((type) => (
            <button
              key={type}
              type="button"
              aria-pressed={filter === type}
              onClick={() => setFilter(type)}
              className={chipClass(filter === type)}
            >
              {type}
              <span
                className={`tabular-nums! ${filter === type ? "text-[var(--ov-blue)]!" : "text-[var(--ov-muted)]!"}`}
              >
                {type === ALL
                  ? plans.length
                  : plans.filter((plan) => plan.label === type).length}
              </span>
            </button>
          ))}
        </div>
      )}

      <ul
        key={filter}
        className={`${swapClass} m-0! p-0! list-none! grid! grid-cols-1! gap-4! ${single ? "" : "sm:grid-cols-2!"}`}
      >
        {shown.map((plan) => {
          const area = plan.area !== plan.configuration ? plan.area : null;
          return (
            <li key={plan.key} className="min-w-0!">
              <figure className="m-0!">
                <Link
                  href={plan.href}
                  className={`group/plan flex! h-full! flex-col! overflow-hidden! rounded-2xl! border! border-[#e6ebf2]! bg-white! no-underline! transition-[border-color,box-shadow,transform]! duration-200! ease-out-quint! hover:-translate-y-0.5! hover:border-[#cfdcf0]! hover:shadow-[0_16px_32px_-20px_rgba(22,69,191,0.35)]! ${FOCUS_RING}`}
                >
                  <span className="relative! block! bg-[linear-gradient(180deg,#fafcff,#f1f5fd)]!">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={plan.src}
                      alt={plan.alt}
                      title={plan.titleText}
                      loading="lazy"
                      decoding="async"
                      className={`block! w-full! object-contain! mix-blend-multiply! transition-transform! duration-500! ease-out-quint! group-hover/plan:scale-[1.03]! ${
                        single ? "aspect-[16/9]! p-8!" : "aspect-[4/3]! p-5!"
                      }`}
                    />
                    <span className="absolute! left-3! top-3! rounded-full! bg-white! px-2.5! py-1! text-[11px]! font-semibold! text-[var(--ov-ink-2)]! shadow-[0_1px_2px_rgba(10,15,28,0.08)]!">
                      {plan.floorName}
                    </span>
                  </span>
                  <span className="flex! items-center! justify-between! gap-3! border-t! border-[#eef1f6]! px-4! py-3.5!">
                    <span className="min-w-0!">
                      <span
                        className={`block! truncate! text-[15px]! font-semibold! ${INK}`}
                      >
                        {plan.label} · {plan.configuration}
                      </span>
                      {area && (
                        <span
                          className={`block! text-[13px]! tabular-nums! ${MUTED}`}
                        >
                          {area}
                        </span>
                      )}
                    </span>
                    <span
                      aria-hidden="true"
                      className="grid! w-8! h-8! shrink-0! place-items-center! rounded-full! bg-[#f2f4f8]! text-[var(--ov-ink-2)]! transition-colors! duration-150! group-hover/plan:bg-[var(--ov-sky)]! group-hover/plan:text-[var(--ov-blue)]!"
                    >
                      <ArrowUpRight className="w-4! h-4!" />
                    </span>
                  </span>
                </Link>
                {plan.caption && (
                  <figcaption className="mt-2! text-sm! text-gray-600!">
                    {plan.caption}
                  </figcaption>
                )}
              </figure>
            </li>
          );
        })}
      </ul>

      {pool.length > SHOWN && (
        <p className={`m-0! mt-4! text-sm! ${MUTED}`}>
          {pool.length - SHOWN} more on the floor plans page.
        </p>
      )}
    </div>
  );
}
