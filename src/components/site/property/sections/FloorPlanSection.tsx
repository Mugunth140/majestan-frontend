import { type SeoProperty, type SeoPropertyUnit } from "@/lib/api/property-by-slug";
import {
  Building2,
  BedDouble,
  Bath,
  Car,
  Ruler,
  Square,
  Download,
  MessageSquare,
  LayoutGrid,
  Maximize2,
  DoorOpen,
} from "lucide-react";

type FloorPlanSectionProps = {
  property: SeoProperty;
};

export function FloorPlanSection({ property }: FloorPlanSectionProps) {
  const details = property.details;

  // Units that have a floor plan image uploaded
  const legacyUnitsWithFloorPlans: SeoPropertyUnit[] = (property.units ?? []).filter(
    (u) => !!u.floorPlanImageUrl
  );
  
  const newFloorPlanImages = property.details?.floorPlanImages || [];
  
  const floorPlansToDisplay = newFloorPlanImages.length > 0 
    ? newFloorPlanImages 
    : legacyUnitsWithFloorPlans.map(u => ({ title: u.title, imageUrl: u.floorPlanImageUrl, imageKey: u.floorPlanImageKey }));

  const hasFloorPlanImages = floorPlansToDisplay.length > 0;
  
  const roomDimensions = property.details?.roomDimensions || [];
  const hasRoomDimensions = roomDimensions.length > 0;

  const formatArea = (area: string | null | undefined) => {
    if (!area) return "—";
    const num = parseFloat(area);
    if (isNaN(num)) return area;
    return num.toLocaleString("en-IN");
  };

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

  const measurements = [
    {
      label: "Total Area",
      value: details?.areaSqft ? `${formatArea(details.areaSqft)} sq.ft` : "—",
      icon: Maximize2,
    },
    {
      label: "Bedrooms",
      value: details?.bedrooms ? `${details.bedrooms} BHK` : "—",
      icon: BedDouble,
    },
    {
      label: "Bathrooms",
      value: details?.bathrooms ? `${details.bathrooms} Bath` : "—",
      icon: Bath,
    },
    {
      label: "Parking",
      value: details?.parking ? `${details.parking} Covered` : "—",
      icon: Car,
    },
  ];

  return (
    <div className="space-y-8!">
      {/* Floor Plan Image Display */}
      <div className="bg-white! rounded-[24px]! p-8! md:p-10! border! border-gray-200! shadow-sm!">
        <div className="flex! items-center! gap-4! mb-8!">
          <div className="w-14! h-14! rounded-full! bg-gray-50! flex! items-center! justify-center!">
            <LayoutGrid className="w-6! h-6! text-gray-600!" />
          </div>
          <div>
            <h2 className="text-2xl! md:text-3xl! font-semibold! text-gray-900!">
              Floor Plan
            </h2>
            <p className="text-sm! font-normal! text-gray-500! mt-1!">Layout and space configuration</p>
          </div>
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
        <div className="flex! items-center! gap-4! mb-8!">
          <div className="w-14! h-14! rounded-full! bg-gray-50! flex! items-center! justify-center!">
            <Ruler className="w-6! h-6! text-gray-600!" />
          </div>
          <div>
            <h3 className="text-2xl! font-semibold! text-gray-900!">
              Key Measurements
            </h3>
            <p className="text-sm! font-normal! text-gray-500! mt-1!">Space specifications at a glance</p>
          </div>
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
          <div className="flex! items-center! gap-4! mb-8!">
            <div className="w-14! h-14! rounded-full! bg-gray-50! flex! items-center! justify-center!">
              <Ruler className="w-6! h-6! text-gray-600!" />
            </div>
            <div>
              <h3 className="text-2xl! font-semibold! text-gray-900!">
                Room Dimensions
              </h3>
              <p className="text-sm! font-normal! text-gray-500! mt-1!">Detailed dimensions of the property rooms</p>
            </div>
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

      {/* Request Floor Plan CTA */}
      <div className="bg-gray-50! rounded-[24px]! p-8! md:p-10! border! border-gray-200!">
        <div className="flex! flex-col! md:flex-row! items-start! md:items-center! justify-between! gap-8!">
          <div className="flex! items-start! gap-5!">
            <div className="w-14! h-14! rounded-full! bg-white! flex! items-center! justify-center! shrink-0! border! border-gray-200!">
              <Download className="w-6! h-6! text-gray-600!" />
            </div>
            <div>
              <h3 className="text-xl! font-semibold! mb-2! text-gray-900!">
                Need the detailed floor plan?
              </h3>
              <p className="text-gray-500! font-light! text-base! leading-relaxed!">
                Request the complete floor plan with exact measurements and room layouts.
              </p>
            </div>
          </div>
          <button className="w-full! md:w-auto! px-8! py-3.5! bg-gray-900! text-white! font-medium! rounded-full! hover:bg-gray-800! transition-all! shrink-0! flex! items-center! justify-center! gap-2!">
            <MessageSquare className="w-4.5! h-4.5!" />
            Request Floor Plan
          </button>
        </div>
      </div>
    </div>
  );
}
