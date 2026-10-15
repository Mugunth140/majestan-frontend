import { IconMark, Panel, PanelLink } from "@/components/site/project/overview/overview-ui";
import { PropertyFloorPlanGallery } from "./PropertyFloorPlanGallery";
import type { PropertyFloorPlan } from "@/lib/property-floor-plans";
import { getFloorPlanMeasurements } from "@/lib/floor-plan-measurements";
import type { SeoPropertyDetails } from "@/lib/api/property-by-slug";

type FloorPlanTeaserProps = {
  details: SeoPropertyDetails;
  floorPlanHref: string;
  plans?: PropertyFloorPlan[];
  propertyTitle?: string;
};

/**
 * Overview preview and key measurements. Drawings use the same fullscreen
 * carousel as the floor-plan page, including every named floor.
 */
export function FloorPlanTeaser({ details, floorPlanHref, plans = [], propertyTitle }: FloorPlanTeaserProps) {
  const measurements = getFloorPlanMeasurements(details);

  return (
    <Panel id="floor-plan-preview" title="Floor Plan"
      action={<PanelLink href={floorPlanHref}>{plans.length > 2 ? "View more" : "View All"}</PanelLink>}>
      {plans.length > 0 && <PropertyFloorPlanGallery plans={plans} propertyTitle={propertyTitle} preview />}
      <div className="mt-6! pt-6! border-t! border-gray-100! grid! grid-cols-2! md:grid-cols-4! gap-6!">
        {measurements.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex! items-center! gap-3!">
              <IconMark Icon={Icon} size="sm" />
              <span className="min-w-0!">
                <span className="block! text-xs! text-[#5f6b80]! font-normal! leading-tight!">
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
    </Panel>
  );
}
