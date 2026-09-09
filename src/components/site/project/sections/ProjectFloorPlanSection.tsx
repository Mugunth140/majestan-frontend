import type { ProjectDetail } from "@/lib/api/projects";
import { formatINR } from "@/lib/api/projects";

export function ProjectFloorPlanSection({ project }: { project: ProjectDetail }) {
  const withPlans = project.units.filter((u) => u.floorPlanImageUrl);
  if (withPlans.length === 0) return null;
  return (
    <section id="floor-plans" className="bg-white! rounded-2xl! border! border-gray-100! shadow-sm! p-6! md:p-8! scroll-mt-40!">
      <h2 className="text-xl! md:text-2xl! font-bold! text-gray-900! font-['Lexend',sans-serif]! mb-5!">Floor Plans</h2>
      <div className="grid! grid-cols-1! md:grid-cols-2! gap-5!">
        {withPlans.map((u) => (
          <figure key={u.id} className="border! border-gray-100! rounded-xl! overflow-hidden!">
            <img src={u.floorPlanImageUrl!} alt={`${u.bedrooms != null ? `${u.bedrooms} BHK` : u.unitCode} floor plan`} className="w-full! object-contain! bg-gray-50!" loading="lazy" />
            <figcaption className="px-4! py-3! text-sm! font-bold! text-gray-700! border-t! border-gray-100!">
              {u.bedrooms != null ? `${u.bedrooms} BHK` : u.unitCode}
              {u.builtupAreaSqft ? ` · ${Number(u.builtupAreaSqft).toLocaleString("en-IN")} sq.ft` : ""}
              {u.price ? ` · ${formatINR(u.price)}` : ""}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
