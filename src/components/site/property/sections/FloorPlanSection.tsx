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
      color: "bg-[#27427f]/10 text-[#27427f]",
    },
    {
      label: "Bedrooms",
      value: details?.bedrooms ? `${details.bedrooms} BHK` : "—",
      icon: BedDouble,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Bathrooms",
      value: details?.bathrooms ? `${details.bathrooms} Bath` : "—",
      icon: Bath,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Parking",
      value: details?.parking ? `${details.parking} Covered` : "—",
      icon: Car,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Floor Plan Display */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#27427f]/10 flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-[#27427f]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#161e2d] font-['Lexend',sans-serif]">
              Floor Plan
            </h2>
            <p className="text-sm text-gray-400">Layout and space configuration</p>
          </div>
        </div>

        {hasFloorPlanImage ? (
          <div className="relative rounded-xl overflow-hidden border border-gray-100">
            {/* Floor plan image would go here */}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-20 h-20 rounded-2xl bg-[#27427f]/5 flex items-center justify-center mb-6">
              <Building2 className="w-10 h-10 text-[#27427f]/40" />
            </div>
            <h3 className="text-lg font-semibold text-[#161e2d] mb-2 font-['Lexend',sans-serif]">
              Floor plan will be available soon
            </h3>
            <p className="text-gray-400 text-sm max-w-md">
              The detailed floor plan for this property is being prepared.
              Request it below and we&apos;ll send it to you as soon as it&apos;s ready.
            </p>
          </div>
        )}
      </div>

      {/* Key Measurements */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Ruler className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#161e2d] font-['Lexend',sans-serif]">
              Key Measurements
            </h3>
            <p className="text-sm text-gray-400">Space specifications at a glance</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {measurements.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="rounded-xl border border-gray-100 p-5 text-center hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mx-auto mb-3`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <p className="text-sm text-gray-400 mb-1">{item.label}</p>
                <p className="text-lg font-bold text-[#161e2d]">{item.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unit Configuration Table */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <DoorOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#161e2d] font-['Lexend',sans-serif]">
              Unit Configuration
            </h3>
            <p className="text-sm text-gray-400">Detailed breakdown of the property unit</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-5 py-3.5 text-sm font-semibold text-gray-500 rounded-l-xl">
                  Type
                </th>
                <th className="px-5 py-3.5 text-sm font-semibold text-gray-500">BHK</th>
                <th className="px-5 py-3.5 text-sm font-semibold text-gray-500">Area</th>
                <th className="px-5 py-3.5 text-sm font-semibold text-gray-500">Bathrooms</th>
                <th className="px-5 py-3.5 text-sm font-semibold text-gray-500 rounded-r-xl">
                  Parking
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Square className="w-4 h-4 text-[#27427f]" />
                    <span className="font-medium text-[#161e2d]">{propertyTypeLabel}</span>
                  </div>
                </td>
                <td className="px-5 py-4 font-medium text-[#161e2d]">
                  {details?.bedrooms ? `${details.bedrooms} BHK` : "—"}
                </td>
                <td className="px-5 py-4 font-medium text-[#161e2d]">
                  {details?.areaSqft ? `${formatArea(details.areaSqft)} sq.ft` : "—"}
                </td>
                <td className="px-5 py-4 font-medium text-[#161e2d]">
                  {details?.bathrooms ?? "—"}
                </td>
                <td className="px-5 py-4 font-medium text-[#161e2d]">
                  {details?.parking ? `${details.parking} Covered` : "—"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Floor Plan CTA */}
      <div className="bg-gradient-to-br from-[#27427f] to-[#1a2d5a] rounded-2xl p-6 md:p-8 shadow-sm text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-['Lexend',sans-serif] mb-1">
                Need the detailed floor plan?
              </h3>
              <p className="text-white/70 text-sm">
                Request the complete floor plan with exact measurements and room layouts.
              </p>
            </div>
          </div>
          <button className="px-8 py-3.5 bg-[#ffc900] hover:bg-[#f0bd00] text-[#161e2d] font-bold rounded-xl transition-all shadow-[0_4px_14px_rgba(255,201,0,0.3)] hover:shadow-[0_6px_20px_rgba(255,201,0,0.45)] shrink-0 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Request Floor Plan
          </button>
        </div>
      </div>
    </div>
  );
}
