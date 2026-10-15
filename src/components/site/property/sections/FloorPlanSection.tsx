import type { SeoProperty } from "@/lib/api/property-by-slug";
import { getFloorPlanLabel, getTypeMeasurements, isGroundPlanType } from "@/lib/property-sections";
import { NeedMoreDetails } from "@/components/site/property/NeedMoreDetails";
import { Panel, IconMark } from "@/components/site/project/overview/overview-ui";
import { getPropertyFloorPlans } from "@/lib/property-floor-plans";
import { PropertyFloorPlanGallery } from "../PropertyFloorPlanGallery";

type FloorPlanSectionProps = { property: SeoProperty; embedded?: boolean };

export function FloorPlanSection({ property, embedded = false }: FloorPlanSectionProps) {
  const plans = getPropertyFloorPlans(property);
  const roomDimensions = property.details?.roomDimensions ?? [];
  const measurements = getTypeMeasurements(property.details, property.propertyType);
  const planLabel = getFloorPlanLabel(property.propertyType);

  return (
    <div className="flex! flex-col! gap-6! min-w-0!">
      <Panel id="property-plans" title={planLabel} meta="Layouts and space configuration">
        {plans.length ? (
          <PropertyFloorPlanGallery plans={plans} propertyTitle={property.title} />
        ) : (
          <div className="mt-6! pt-6! border-t! border-[#e2e9f4]!">
            <p className="m-0! text-base! font-medium! text-[#0a0f1c]!">Floor plan will be available soon</p>
            <p className="mt-2! text-sm! text-[#465066]! leading-relaxed!">Contact us to request the detailed layout for this property.</p>
          </div>
        )}
      </Panel>
      {!isGroundPlanType(property.propertyType) && (
        <Panel id="property-measurements" title="Key Measurements" meta="Space specifications at a glance">
          <dl className="m-0! mt-6! pt-6! border-t! border-[#e2e9f4]! grid! grid-cols-2! gap-6!">
            {measurements.map((item) => (
              <div key={item.label} className="flex! items-center! gap-3! min-w-0!">
                <IconMark Icon={item.icon} size="sm" />
                <div className="min-w-0!">
                  <dt className="text-xs! text-[#5f6b80]!">{item.label}</dt>
                  <dd className="m-0! mt-1! text-base! font-semibold! text-[#1c2433]!">{item.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </Panel>
      )}
      {roomDimensions.length > 0 && (
        <Panel id="property-room-dimensions" title="Room Dimensions" meta="Detailed dimensions of the property rooms">
          <dl className="m-0! mt-4! grid! grid-cols-2! sm:grid-cols-3! gap-3!">
            {roomDimensions.map((room, index) => {
              const dimensions = room.dimensions.trim();
              const value = !dimensions ? "—"
                : /\b(?:ft|feet|foot|m|cm|mm|metres?|meters?)\b|['′\"″]/i.test(dimensions)
                  ? dimensions : `${dimensions} ft`;
              return (
                <div key={`${room.name}-${index}`} className="min-w-0! flex! flex-col! gap-1! rounded-lg! border! border-[#e2e9f4]! bg-[#f7f9fd]! p-3!">
                  <dt className="text-xs! font-medium! text-[#465066]!">{room.name}</dt>
                  <dd className="m-0! text-sm! font-semibold! text-[#0a0f1c]! tabular-nums! break-words!">{value}</dd>
                </div>
              );
            })}
          </dl>
        </Panel>
      )}
      {!embedded && <NeedMoreDetails propertyType={property.propertyType} />}
    </div>
  );
}
