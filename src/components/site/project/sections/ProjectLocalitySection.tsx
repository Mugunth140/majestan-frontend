import type { ProjectDetail } from "@/lib/api/projects";
import { LocalityInteractiveMap } from "@/components/site/locality/LocalityInteractiveMap";

export function ProjectLocalitySection({ project }: { project: ProjectDetail }) {
  const query = [project.sublocation, project.city].filter(Boolean).join(", ");
  const label = [project.sublocation, project.city].filter(Boolean).join(", ") || project.name;

  return (
    <section id="locality" className="bg-white! rounded-2xl! border! border-gray-100! shadow-sm! p-6! md:p-8! scroll-mt-40!">
      <h2 className="text-xl! md:text-2xl! font-bold! text-gray-900! font-['Lexend',sans-serif]! mb-5!">
        Locality — {project.sublocation || project.city}
      </h2>
      {project.address && <p className="text-gray-600! mb-5!">{project.address}</p>}
      <div className="flex! flex-wrap! gap-2! mb-5!">
        {[project.sublocation, project.city, project.state].filter(Boolean).map((tag) => (
          <span key={tag as string} className="text-xs! font-bold! text-gray-600! bg-gray-100! rounded-lg! px-3! py-1.5!">{tag}</span>
        ))}
      </div>
      <div className="rounded-xl! overflow-hidden! border! border-gray-100!">
        <LocalityInteractiveMap query={query} label={label} height={320} />
      </div>
    </section>
  );
}
