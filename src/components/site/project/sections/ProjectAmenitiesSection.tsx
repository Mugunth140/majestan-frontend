import type { ProjectDetail } from "@/lib/api/projects";

export function ProjectAmenitiesSection({ project }: { project: ProjectDetail }) {
  return (
    <section id="amenities" className="bg-white! rounded-2xl! border! border-gray-100! shadow-sm! p-6! md:p-8! scroll-mt-40!">
      <h2 className="text-xl! md:text-2xl! font-bold! text-gray-900! font-['Lexend',sans-serif]! mb-5!">Amenities</h2>
      <p className="text-gray-500!">Amenity details for {project.name} are being updated. Contact us for the full amenities list.</p>
    </section>
  );
}
