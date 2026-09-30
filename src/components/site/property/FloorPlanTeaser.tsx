import Link from "next/link";
import { getFloorPlanMeasurements } from "@/lib/floor-plan-measurements";
import type { SeoPropertyDetails } from "@/lib/api/property-by-slug";

type FloorPlanTeaserProps = {
  details: SeoPropertyDetails;
  floorPlanHref: string;
};

/**
 * Overview teaser for the floor-plan sub-page: the key measurements only,
 * never the uploaded plan imagery. Values come from the same helper as the
 * sub-page, so the teaser can never disagree with it.
 */
export function FloorPlanTeaser({ details, floorPlanHref }: FloorPlanTeaserProps) {
  const measurements = getFloorPlanMeasurements(details);

  return (
    <div className="bg-white! rounded-[20px]! border! border-gray-200/70! p-6! md:p-8! shadow-sm!">
      <div className="flex! items-center! justify-between!">
        <h2 className="text-lg! md:text-xl! font-normal! text-gray-900!">Floor Plan</h2>
        <Link
          href={floorPlanHref}
          className="inline-flex! items-center! gap-2! text-sm! font-medium! text-[#27427f]! hover:text-[#1a2d59]! transition-colors! no-underline!"
        >
          View All
        </Link>
      </div>
      <div className="mt-6! pt-6! border-t! border-gray-100! grid! grid-cols-2! md:grid-cols-4! gap-6!">
        {measurements.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex! items-center! gap-3!">
              <div className="text-gray-500!">
                <Icon className="w-4.5! h-4.5!" />
              </div>
              <span className="min-w-0!">
                <span className="block! text-[12px]! text-gray-400! font-normal! leading-tight!">
                  {item.label}
                </span>
                <span className="block! text-base! font-semibold! text-gray-800! mt-1! leading-snug!">
                  {item.value}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
