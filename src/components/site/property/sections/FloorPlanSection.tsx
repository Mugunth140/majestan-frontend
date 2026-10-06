import { type SeoProperty, type SeoPropertyUnit } from "@/lib/api/property-by-slug";
import { getFloorPlanMeasurements } from "@/lib/floor-plan-measurements";
import { getFloorPlanLabel } from "@/lib/property-sections";
import { NeedMoreDetails } from "@/components/site/property/NeedMoreDetails";
import {
  Building2,
  Square,
  DoorOpen,
} from "lucide-react";

type FloorPlanSectionProps = {
  property: SeoProperty;
  /** Stacked on the single-page overview: skip the trailing CTA (one page-level CTA instead). */
  embedded?: boolean;
};

export function FloorPlanSection({ property, embedded = false }: FloorPlanSectionProps) {
  const details = property.details;

  // Units that have a floor plan image uploaded
  const legacyUnitsWithFloorPlans: SeoPropertyUnit[] = (property.units ?? []).filter(
    (u) => !!u.floorPlanImageUrl
  );

  const newFloorPlanImages = property.details?.floorPlanImages || [];

  // Every source shows, newest upload path first: CRM sidebar files, then the
  // detail plan images, then legacy unit plans.
  const floorPlansToDisplay = [
    ...(property.floorPlanFiles ?? []).map((f) => ({
      title: f.title,
      imageUrl: f.imageUrl,
      imageKey: f.imageKey,
    })),
    ...newFloorPlanImages,
    ...legacyUnitsWithFloorPlans.map(u => ({ title: u.title, imageUrl: u.floorPlanImageUrl, imageKey: u.floorPlanImageKey })),
  ];

  const hasFloorPlanImages = floorPlansToDisplay.length > 0;
  
  const roomDimensions = property.details?.roomDimensions || [];
  const hasRoomDimensions = roomDimensions.length > 0;

  // Shared with the overview teaser — one definition, so the teaser can never
  // drift from the page it links to.
  const measurements = getFloorPlanMeasurements(property.details);

  const formatPrice = (price: string | null | undefined) => {
    if (!price) return null;
    const n = parseFloat(price);
    if (!isFinite(n) || n === 0) return null;
    if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(2)} Cr`;
    if (n >= 100_000) return `₹${(n / 100_000).toFixed(2)} Lk`;
    return `₹${n.toLocaleString("en-IN")}`;
  };

  const propertyTypeLabel = property.propertyType
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="space-y-8!">
      {/* Floor Plan Image Display */}
      <div className="bg-white! rounded-[24px]! p-8! md:p-10! border! border-gray-200! shadow-sm!">
        <div className="mb-8!">
          <h2 className="text-2xl! md:text-3xl! font-semibold! text-gray-900!">
            {getFloorPlanLabel(property.propertyType)}
          </h2>
          <p className="text-sm! font-normal! text-gray-500! mt-1!">Layout and space configuration</p>
        </div>

        {hasFloorPlanImages ? (
          <div className="grid! grid-cols-1! gap-8!">
            {floorPlansToDisplay.map((fp, idx) => (
              <div
                key={idx}
                className="rounded-[20px]! overflow-hidden! border! border-gray-200! bg-white! shadow-sm!"
              >
                <div className="relative! w-full! h-[60vh]! overflow-hidden! bg-gray-50!">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fp.imageUrl!}
                    alt={fp.title ?? "Floor Plan"}
                    className="w-full! h-full! object-contain!"
                  />
                </div>
                {fp.title && (
                  <div className="p-4! border-t! border-gray-100! flex! items-center! justify-between! gap-4!">
                    <p className="font-medium! text-gray-900! text-lg! truncate!">
                      {fp.title}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[20px]! border! border-gray-200! bg-gray-50/50! flex! flex-col! items-center! justify-center! py-20! px-6! text-center!">
            <div className="w-20! h-20! rounded-full! bg-white! border! border-gray-200! flex! items-center! justify-center! mb-6!">
              <Building2 className="w-8! h-8! text-gray-400!" />
            </div>
            <h3 className="text-xl! font-medium! text-gray-900! mb-3!">
              Floor plan will be available soon
            </h3>
            <p className="text-gray-500! font-light! text-base! max-w-lg! leading-relaxed!">
              The detailed floor plan for this property is being prepared.
              Request it below and we&apos;ll send it to you as soon as it&apos;s ready.
            </p>
          </div>
        )}
      </div>

      {/* Key Measurements */}
      <div className="bg-white! rounded-[24px]! p-8! md:p-10! border! border-gray-200! shadow-sm!">
        <div className="mb-8!">
          <h3 className="text-2xl! font-semibold! text-gray-900!">
            Key Measurements
          </h3>
          <p className="text-sm! font-normal! text-gray-500! mt-1!">Space specifications at a glance</p>
        </div>

        <div className="grid! grid-cols-2! md:grid-cols-4! gap-5!">
          {measurements.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-[20px]! border! border-gray-200! p-6! text-center! bg-white! hover:border-gray-300! hover:shadow-sm! hover:-translate-y-0.5! transition-all! duration-300!"
              >
                <div
                  className={`w-12! h-12! rounded-full! bg-gray-50! text-gray-600! flex! items-center! justify-center! mx-auto! mb-4!`}
                >
                  <Icon className="w-5! h-5!" />
                </div>
                <p className="text-xs! font-normal! text-gray-500! uppercase! tracking-widest! mb-1.5!">{item.label}</p>
                <p className="text-lg! font-medium! text-gray-900!">{item.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Room Dimensions */}
      {hasRoomDimensions && (
        <div className="bg-white! rounded-[24px]! p-8! md:p-10! border! border-gray-200! shadow-sm!">
          <div className="mb-8!">
            <h3 className="text-2xl! font-semibold! text-gray-900!">
              Room Dimensions
            </h3>
            <p className="text-sm! font-normal! text-gray-500! mt-1!">Detailed dimensions of the property rooms</p>
          </div>

          <div className="grid! grid-cols-1! sm:grid-cols-2! md:grid-cols-3! gap-4!">
            {roomDimensions.map((room: any, index: number) => (
              <div key={index} className="flex! items-center! justify-between! p-4! rounded-xl! bg-gray-50! border! border-gray-100!">
                <span className="text-gray-700! font-medium!">{room.name}</span>
                <span className="text-gray-900! font-semibold! bg-white! px-3! py-1! rounded-lg! shadow-sm! border! border-gray-200! text-sm!">{room.dimensions}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unit Configuration Table (Commented out as requested for projects) */}
      {/* 
      <div className="bg-white! rounded-[24px]! p-8! md:p-10! border! border-gray-200! shadow-sm!">
        <div className="flex! items-center! gap-4! mb-8!">
          <div className="w-14! h-14! rounded-full! bg-gray-50! flex! items-center! justify-center!">
            <DoorOpen className="w-6! h-6! text-gray-600!" />
          </div>
          <div>
            <h3 className="text-2xl! font-semibold! text-gray-900!">
              Unit Configuration
            </h3>
            <p className="text-sm! font-normal! text-gray-500! mt-1!">Detailed breakdown of the property unit</p>
          </div>
        </div>

        <div className="overflow-x-auto! rounded-[20px]! border! border-gray-200!">
          <table className="w-full! border-collapse!">
            <thead>
              <tr className="bg-gray-50! border-b! border-gray-200!">
                <th className="px-6! py-4! text-xs! font-medium! text-gray-500! uppercase! tracking-widest! text-left!">
                  Type
                </th>
                <th className="px-6! py-4! text-xs! font-medium! text-gray-500! uppercase! tracking-widest! text-left!">BHK</th>
                <th className="px-6! py-4! text-xs! font-medium! text-gray-500! uppercase! tracking-widest! text-left!">Area</th>
                <th className="px-6! py-4! text-xs! font-medium! text-gray-500! uppercase! tracking-widest! text-left!">Bathrooms</th>
                <th className="px-6! py-4! text-xs! font-medium! text-gray-500! uppercase! tracking-widest! text-left!">
                  Parking
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white! hover:bg-gray-50/50! transition-colors!">
                <td className="px-6! py-5!">
                  <div className="flex! items-center! gap-3!">
                    <div className="w-10! h-10! rounded-full! bg-gray-50! flex! items-center! justify-center! shrink-0!">
                      <Square className="w-4.5! h-4.5! text-gray-600!" />
                    </div>
                    <span className="font-medium! text-gray-900! text-sm!">{propertyTypeLabel}</span>
                  </div>
                </td>
                <td className="px-6! py-5! font-medium! text-gray-900! text-sm!">
                  {details?.bedrooms ? `${details.bedrooms} BHK` : "—"}
                </td>
                <td className="px-6! py-5! font-medium! text-gray-900! text-sm!">
                  {details?.areaSqft ? `${formatArea(details.areaSqft)} sq.ft` : "—"}
                </td>
                <td className="px-6! py-5! font-medium! text-gray-900! text-sm!">
                  {details?.bathrooms ?? "—"}
                </td>
                <td className="px-6! py-5! font-medium! text-gray-900! text-sm!">
                  {details?.parking ? `${details.parking} Covered` : "—"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      */}

      {/* Shared contact call-to-action, identical on every page (skipped when embedded) */}
      {!embedded && <NeedMoreDetails />}
    </div>
  );
}
