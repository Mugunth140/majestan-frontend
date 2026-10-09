import { BadgeCheck } from "lucide-react";
import type { ProjectDetail } from "@/lib/api/projects";

export function ProjectAmenitiesSection({ project }: { project: ProjectDetail }) {
  const items = (project.projectAmenities ?? [])
    .map((pa) => pa.amenity?.name?.trim())
    .filter((n): n is string => !!n);
  return (
    <section id="amenities" className="bg-white! rounded-2xl! border! border-gray-100! shadow-sm! p-6! md:p-8! scroll-mt-40!">
      <h2 className="text-xl! md:text-2xl! font-bold! text-gray-900! font-['Lexend',sans-serif]! mb-5!">Amenities</h2>
      {items.length === 0 ? (
        <p className="text-gray-500!">Amenity details for {project.name} are being updated. Contact us for the full amenities list.</p>
      ) : (
        <div className="grid! grid-cols-2! sm:grid-cols-3! gap-3!">
          {items.map((name) => (
            <span key={name} className="inline-flex! items-center! gap-2! text-sm! font-medium! text-gray-700!">
              <BadgeCheck className="w-4! h-4! text-emerald-500! shrink-0!" />
              {name}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
