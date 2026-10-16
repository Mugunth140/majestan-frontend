"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSelectedCity } from "@/contexts/LocationContext";
import { buildPopularSearches } from "@/lib/popular-searches";
import { useInventoryCounts } from "@/providers/popular-searches-provider";

const FOCUS_RING =
  "focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#2563eb]! focus-visible:ring-offset-2!";

const ARROW =
  `inline-flex! h-9! w-9! cursor-pointer! items-center! justify-center! rounded-full! border! border-solid! border-[#cfdcf0]! bg-white! text-[#27427f]! transition-[background-color,border-color,color]! duration-150! hover:border-[#27427f]! hover:bg-[#27427f]! hover:text-white! disabled:pointer-events-none! disabled:opacity-35! ${FOCUS_RING}`;

/**
 * Footer "Popular Searches": one card per category the visitor's city has
 * listings in (every type, Buy and Rent), each linking its localities. Built from live inventory so no chip lands on an
 * empty listing page; hidden when nothing is listed. The cards sit on one
 * horizontal rail at every width so any number of categories fits.
 */
export function PopularSearches() {
  const counts = useInventoryCounts();
  const city = useSelectedCity();
  const popular = buildPopularSearches(counts, city);

  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update, popular?.groups.length]);

  const scrollByCard = (dir: -1 | 1) => {
    const el = trackRef.current;
    const card = el?.querySelector<HTMLElement>("[data-card]");
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.offsetWidth + 32), behavior: "smooth" });
  };

  if (!popular) return null;

  return (
    <section
      aria-labelledby="popular-searches-heading"
      className="font-manrope-page relative! z-10! w-full! bg-white! border-t! border-gray-100! py-14!"
    >
      <div className="container! mx-auto! px-4! md:px-6! lg:px-8!">
        <div className="flex! items-center! justify-between! gap-4! mb-6!">
          <p id="popular-searches-heading" className="m-0! text-[15px]! font-bold! tracking-wide! uppercase! text-[#27427f]!">
            Popular Searches
          </p>
          {(canPrev || canNext) && (
            <div className="hidden! shrink-0! items-center! gap-2! sm:flex!">
              <button type="button" onClick={() => scrollByCard(-1)} disabled={!canPrev} className={ARROW} aria-label="Previous searches">
                <ChevronLeft className="h-4! w-4!" />
              </button>
              <button type="button" onClick={() => scrollByCard(1)} disabled={!canNext} className={ARROW} aria-label="More searches">
                <ChevronRight className="h-4! w-4!" />
              </button>
            </div>
          )}
        </div>

        {/* One rail at every width. The negative margin + matching padding
            bleeds it to the viewport edge on small screens so a peeking card
            reads as "scroll me"; scroll-pl/pr keeps mandatory snapping from
            shifting the first card off the heading's left edge. */}
        <div
          ref={trackRef}
          className="flex! flex-nowrap! items-stretch! gap-8! overflow-x-auto! overscroll-x-contain! snap-x! snap-mandatory! hide-scrollbar -mx-4! px-4! pb-2! scroll-pl-4! scroll-pr-4! md:-mx-6! md:px-6! md:scroll-pl-6! md:scroll-pr-6! lg:mx-0! lg:px-0! lg:scroll-pl-0! lg:scroll-pr-0!"
        >
          {popular.groups.map((group) => (
            <div
              key={group.key}
              data-card
              className="w-[85%]! shrink-0! snap-start! sm:w-[280px]!"
            >
              <p className="m-0! text-[13px]! font-bold! text-[#161e2d]! mb-3! pb-2! border-b! border-gray-100! tracking-wide!">
                {group.title} in {popular.city}
              </p>
              <div className="flex! flex-wrap! gap-2!">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-block! px-3! py-1.5! rounded-lg! bg-[#f4f6fb]! text-[#27427f]! text-[13px]! font-semibold! border! border-[#27427f]/8! no-underline! hover:bg-[#27427f]! hover:text-white! hover:border-[#27427f]! transition-colors! duration-200! ${FOCUS_RING}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
