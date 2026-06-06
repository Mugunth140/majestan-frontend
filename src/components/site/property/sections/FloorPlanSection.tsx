import { type SeoProperty } from "@/lib/api/property-by-slug";
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
  const hasFloorPlanImage = false; // API doesn't provide floor plan images yet

  const formatArea = (area: string) => {
    const num = parseFloat(area);
    if (isNaN(num)) return area;
    return num.toLocaleString("en-IN");
  };

  const propertyTypeLabel = property.propertyType
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // Key measurements derived from available data
  const measurements = [
    {
      label: "Total Area",
      value: details?.areaSqft ? `${formatArea(details.areaSqft)} sq.ft` : "—",
      icon: Maximize2,
      color: "bg-[#27427f]/10! text-[#27427f]!",
    },
    {
      label: "Bedrooms",
      value: details?.bedrooms ? `${details.bedrooms} BHK` : "—",
      icon: BedDouble,
      color: "bg-emerald-50! text-emerald-600!",
    },
    {
      label: "Bathrooms",
      value: details?.bathrooms ? `${details.bathrooms} Bath` : "—",
      icon: Bath,
      color: "bg-blue-50! text-blue-600!",
    },
    {
      label: "Parking",
      value: details?.parking ? `${details.parking} Covered` : "—",
      icon: Car,
      color: "bg-amber-50! text-amber-600!",
    },
  ];

  return (
    <div className="space-y-8!">
      {/* Floor Plan Display */}
      <div className="bg-white! rounded-[32px]! p-8! md:p-10! shadow-[0_8px_30px_rgb(0,0,0,0.04)]! border! border-gray-100/50!">
        <div className="flex! items-center! gap-4! mb-8!">
          <div className="w-14! h-14! rounded-[16px]! bg-[#27427f]/10! flex! items-center! justify-center!">
            <LayoutGrid className="w-6! h-6! text-[#27427f]!" />
          </div>
          <div>
            <h2 className="text-2xl! md:text-3xl! font-extrabold! text-[#161e2d]! font-['Lexend',sans-serif]!">
              Floor Plan
            </h2>
            <p className="text-sm! font-bold! text-gray-400! mt-1!">Layout and space configuration</p>
          </div>
        </div>

        {hasFloorPlanImage ? (
          <div className="relative! rounded-[24px]! overflow-hidden! border! border-gray-100! shadow-sm!">
            {/* Floor plan image would go here */}
          </div>
        ) : (
          <div className="rounded-[24px]! border-2! border-dashed! border-gray-200! bg-gray-50/50! flex! flex-col! items-center! justify-center! py-20! px-6! text-center!">
            <div className="w-24! h-24! rounded-[24px]! bg-white! shadow-sm! border! border-gray-100! flex! items-center! justify-center! mb-6!">
              <Building2 className="w-10! h-10! text-[#27427f]/40!" />
            </div>
            <h3 className="text-xl! font-extrabold! text-[#161e2d]! mb-3! font-['Lexend',sans-serif]!">
              Floor plan will be available soon
            </h3>
            <p className="text-gray-500! text-base! max-w-lg! leading-relaxed!">
              The detailed floor plan for this property is being prepared.
              Request it below and we&apos;ll send it to you as soon as it&apos;s ready.
            </p>
          </div>
        )}
      </div>

      {/* Key Measurements */}
      <div className="bg-white! rounded-[32px]! p-8! md:p-10! shadow-[0_8px_30px_rgb(0,0,0,0.04)]! border! border-gray-100/50!">
        <div className="flex! items-center! gap-4! mb-8!">
          <div className="w-14! h-14! rounded-[16px]! bg-emerald-50! flex! items-center! justify-center!">
            <Ruler className="w-6! h-6! text-emerald-600!" />
          </div>
          <div>
            <h3 className="text-2xl! font-extrabold! text-[#161e2d]! font-['Lexend',sans-serif]!">
              Key Measurements
            </h3>
            <p className="text-sm! font-bold! text-gray-400! mt-1!">Space specifications at a glance</p>
          </div>
        </div>

        <div className="grid! grid-cols-2! md:grid-cols-4! gap-5!">
          {measurements.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-[24px]! border! border-gray-100! p-6! text-center! bg-gray-50/30! hover:bg-white! hover:shadow-lg! hover:-translate-y-1! transition-all! duration-300!"
              >
                <div
                  className={`w-14! h-14! rounded-[16px]! ${item.color} flex! items-center! justify-center! mx-auto! mb-4! shadow-sm!`}
                >
                  <Icon className="w-6! h-6!" />
                </div>
                <p className="text-xs! font-bold! text-gray-400! uppercase! tracking-widest! mb-1.5!">{item.label}</p>
                <p className="text-xl! font-black! text-[#161e2d]!">{item.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unit Configuration Table */}
      <div className="bg-white! rounded-[32px]! p-8! md:p-10! shadow-[0_8px_30px_rgb(0,0,0,0.04)]! border! border-gray-100/50!">
        <div className="flex! items-center! gap-4! mb-8!">
          <div className="w-14! h-14! rounded-[16px]! bg-blue-50! flex! items-center! justify-center!">
            <DoorOpen className="w-6! h-6! text-blue-600!" />
          </div>
          <div>
            <h3 className="text-2xl! font-extrabold! text-[#161e2d]! font-['Lexend',sans-serif]!">
              Unit Configuration
            </h3>
            <p className="text-sm! font-bold! text-gray-400! mt-1!">Detailed breakdown of the property unit</p>
          </div>
        </div>

        <div className="overflow-x-auto! rounded-[24px]! border! border-gray-100! shadow-sm!">
          <table className="w-full! border-collapse!">
            <thead>
              <tr className="bg-gray-50/80! border-b! border-gray-100!">
                <th className="px-6! py-5! text-xs! font-extrabold! text-gray-500! uppercase! tracking-widest! text-left!">
                  Type
                </th>
                <th className="px-6! py-5! text-xs! font-extrabold! text-gray-500! uppercase! tracking-widest! text-left!">BHK</th>
                <th className="px-6! py-5! text-xs! font-extrabold! text-gray-500! uppercase! tracking-widest! text-left!">Area</th>
                <th className="px-6! py-5! text-xs! font-extrabold! text-gray-500! uppercase! tracking-widest! text-left!">Bathrooms</th>
                <th className="px-6! py-5! text-xs! font-extrabold! text-gray-500! uppercase! tracking-widest! text-left!">
                  Parking
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white! hover:bg-gray-50/50! transition-colors!">
                <td className="px-6! py-6!">
                  <div className="flex! items-center! gap-3!">
                    <div className="w-10! h-10! rounded-[12px]! bg-[#27427f]/10! flex! items-center! justify-center! shrink-0!">
                      <Square className="w-5! h-5! text-[#27427f]!" />
                    </div>
                    <span className="font-extrabold! text-[#161e2d]! text-base!">{propertyTypeLabel}</span>
                  </div>
                </td>
                <td className="px-6! py-6! font-bold! text-[#161e2d]! text-base!">
                  {details?.bedrooms ? `${details.bedrooms} BHK` : "—"}
                </td>
                <td className="px-6! py-6! font-bold! text-[#161e2d]! text-base!">
                  {details?.areaSqft ? `${formatArea(details.areaSqft)} sq.ft` : "—"}
                </td>
                <td className="px-6! py-6! font-bold! text-[#161e2d]! text-base!">
                  {details?.bathrooms ?? "—"}
                </td>
                <td className="px-6! py-6! font-bold! text-[#161e2d]! text-base!">
                  {details?.parking ? `${details.parking} Covered` : "—"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Floor Plan CTA */}
      <div className="bg-gradient-to-br! from-[#161e2d]! to-[#27427f]! rounded-[32px]! p-8! md:p-10! shadow-[0_8px_30px_rgb(0,0,0,0.15)]! text-white! relative! overflow-hidden! border! border-white/10!">
        <div className="absolute! inset-0! bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]! opacity-5!" />
        <div className="flex! flex-col! md:flex-row! items-start! md:items-center! justify-between! gap-8! relative! z-10!">
          <div className="flex! items-start! gap-5!">
            <div className="w-14! h-14! rounded-[16px]! bg-white/10! backdrop-blur-md! flex! items-center! justify-center! shrink-0! border! border-white/10!">
              <Download className="w-7! h-7! text-white!" />
            </div>
            <div>
              <h3 className="text-2xl! font-extrabold! font-['Lexend',sans-serif]! mb-2! text-white!">
                Need the detailed floor plan?
              </h3>
              <p className="text-white/70! text-base! leading-relaxed!">
                Request the complete floor plan with exact measurements and room layouts.
              </p>
            </div>
          </div>
          <button className="w-full! md:w-auto! px-8! py-4! bg-gradient-to-r! from-[#ffc900]! to-[#f0bd00]! text-[#161e2d]! font-black! rounded-[16px]! transition-all! shadow-[0_8px_20px_rgba(255,201,0,0.3)]! hover:shadow-[0_12px_25px_rgba(255,201,0,0.4)]! hover:-translate-y-1! shrink-0! flex! items-center! justify-center! gap-3!">
            <MessageSquare className="w-5.5! h-5.5!" />
            Request Floor Plan
          </button>
        </div>
      </div>
    </div>
  );
}
