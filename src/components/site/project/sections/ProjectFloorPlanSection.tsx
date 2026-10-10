import type { ProjectDetail } from "@/lib/api/projects";
import { formatINR } from "@/lib/api/projects";
import { getFloorPlanLabel } from "@/lib/property-sections";
import { NeedMoreDetails } from "@/components/site/property/NeedMoreDetails";
import {
  Banknote,
  BedDouble,
  Building2,
  Ruler,
  Square,
} from "lucide-react";

function formatArea(n: number): string {
  return `${n.toLocaleString("en-IN")} sq.ft`;
}

export function ProjectFloorPlanSection({ project }: { project: ProjectDetail }) {
  const isPlot = project.projectType === "plot";
  const planLabel = getFloorPlanLabel(project.projectType);
  const ranges = project.ranges;

  const withPlans = project.units.filter((u) => u.floorPlanImageUrl);

  const priceRange =
    ranges.minPrice != null
      ? ranges.maxPrice != null && ranges.maxPrice !== ranges.minPrice
        ? `${formatINR(ranges.minPrice)} - ${formatINR(ranges.maxPrice)}`
        : formatINR(ranges.minPrice)
      : null;

  const measurements: { label: string; value: string; icon: React.ElementType }[] = isPlot
    ? [
        ...(ranges.minPlotCents != null
          ? [
              {
                label: "Plot Area",
                value:
                  ranges.maxPlotCents != null && ranges.maxPlotCents !== ranges.minPlotCents
                    ? `${ranges.minPlotCents} - ${ranges.maxPlotCents} cents`
                    : `${ranges.minPlotCents} cents`,
                icon: Ruler,
              },
            ]
          : []),
        ...(ranges.plotDimensions.length > 0
          ? [{ label: "Dimensions", value: ranges.plotDimensions.join(", "), icon: Square }]
          : []),
        { label: "Total Plots", value: String(ranges.unitsCount), icon: Building2 },
        ...(priceRange ? [{ label: "Price Range", value: priceRange, icon: Banknote }] : []),
      ]
    : [
        ...(ranges.bhk.length > 0
          ? [{ label: "Configurations", value: `${ranges.bhk.join(", ")} BHK`, icon: BedDouble }]
          : []),
        ...(ranges.minArea != null
          ? [
              {
                label: "Built-up Area",
                value:
                  ranges.maxArea != null && ranges.maxArea !== ranges.minArea
                    ? `${formatArea(ranges.minArea)} - ${formatArea(ranges.maxArea)}`
                    : formatArea(ranges.minArea),
                icon: Ruler,
              },
            ]
          : []),
        { label: "Total Units", value: String(ranges.unitsCount), icon: Building2 },
        ...(priceRange ? [{ label: "Price Range", value: priceRange, icon: Banknote }] : []),
      ];

  // Distinct (room, dimensions) pairs across all units.
  const seen = new Set<string>();
  const roomRows: { name: string; dimensions: string }[] = [];
  for (const u of project.units) {
    for (const r of u.roomDimensions ?? []) {
      const name = (r?.name ?? "").trim();
      const dimensions = (r?.dimensions ?? "").trim();
      if (!name || !dimensions) continue;
      const key = `${name}||${dimensions}`;
      if (seen.has(key)) continue;
      seen.add(key);
      roomRows.push({ name, dimensions });
    }
  }

  return (
    <div className="space-y-8!">
      {/* Plan Image Display */}
      <div className="bg-white! rounded-[24px]! p-8! md:p-10! border! border-gray-200! shadow-sm!">
        <div className="mb-8!">
          <h2 className="text-2xl! md:text-3xl! font-semibold! text-gray-900!">
            {planLabel}
          </h2>
          <p className="text-sm! font-normal! text-gray-500! mt-1!">Layout and space configuration</p>
        </div>

        {withPlans.length > 0 ? (
          <div className="grid! grid-cols-1! gap-8!">
            {withPlans.map((u) => {
              const title =
                u.title || (u.bedrooms != null ? `${u.bedrooms} BHK` : u.unitCode);
              return (
                <div
                  key={u.id}
                  className="rounded-[20px]! overflow-hidden! border! border-gray-200! bg-white! shadow-sm!"
                >
                  <div className="relative! w-full! h-[60vh]! overflow-hidden! bg-gray-50!">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={u.floorPlanImageUrl!}
                      alt={`${title} ${planLabel.toLowerCase()}`}
                      className="w-full! h-full! object-contain!"
                    />
                  </div>
                  <div className="p-4! border-t! border-gray-100! flex! items-center! justify-between! gap-4!">
                    <p className="font-medium! text-gray-900! text-lg! truncate!">
                      {title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[20px]! border! border-gray-200! bg-gray-50/50! flex! flex-col! items-center! justify-center! py-20! px-6! text-center!">
            <div className="w-20! h-20! rounded-full! bg-white! border! border-gray-200! flex! items-center! justify-center! mb-6!">
              <Building2 className="w-8! h-8! text-gray-400!" />
            </div>
            <h3 className="text-xl! font-medium! text-gray-900! mb-3!">
              {planLabel} will be available soon
            </h3>
            <p className="text-gray-500! font-light! text-base! max-w-lg! leading-relaxed!">
              The detailed {planLabel.toLowerCase()} for this project is being prepared.
              Request it below and we&apos;ll send it to you as soon as it&apos;s ready.
            </p>
          </div>
        )}
      </div>

      {/* Key Measurements */}
      {measurements.length > 0 && (
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
      )}

      {/* Room / Plot Dimensions */}
      {roomRows.length > 0 && (
        <div className="bg-white! rounded-[24px]! p-8! md:p-10! border! border-gray-200! shadow-sm!">
          <div className="mb-8!">
            <h3 className="text-2xl! font-semibold! text-gray-900!">
              {isPlot ? "Plot Dimensions" : "Room Dimensions"}
            </h3>
            <p className="text-sm! font-normal! text-gray-500! mt-1!">
              {isPlot ? "Plot sizes across configurations" : "Detailed dimensions across unit configurations"}
            </p>
          </div>

          <div className="grid! grid-cols-1! sm:grid-cols-2! md:grid-cols-3! gap-4!">
            {roomRows.map((room, index) => (
              <div key={index} className="flex! items-center! justify-between! p-4! rounded-xl! bg-gray-50! border! border-gray-100!">
                <span className="text-gray-700! font-medium!">{room.name}</span>
                <span className="text-gray-900! font-semibold! bg-white! px-3! py-1! rounded-lg! shadow-sm! border! border-gray-200! text-sm!">{room.dimensions}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <NeedMoreDetails propertyType={project.projectType} />
    </div>
  );
}
