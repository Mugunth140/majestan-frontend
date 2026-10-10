import { MapPinned, Navigation } from "lucide-react";
import type { ProjectDetail } from "@/lib/api/projects";
import { LocalityInteractiveMap } from "@/components/site/locality/LocalityInteractiveMap";

export function ProjectLocalitySection({ project }: { project: ProjectDetail }) {
  const query = [project.sublocation, project.city].filter(Boolean).join(", ");
  const label = [project.sublocation, project.city].filter(Boolean).join(", ") || project.name;
  const connectivity = (project.connectivity ?? []).filter((c) => c.label || c.detail);
  const nearby = (project.nearbyCategories ?? []).filter((c) => (c.places ?? []).length > 0);

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
      {connectivity.length > 0 && (
        <div className="mb-6!">
          <h3 className="text-base! font-bold! text-gray-900! mb-3!">Connectivity Highlights</h3>
          <div className="grid! grid-cols-1! sm:grid-cols-2! gap-3!">
            {connectivity.map((c, i) => (
              <div key={i} className="flex! items-center! gap-3! rounded-xl! border! border-gray-100! bg-gray-50/60! px-4! py-3!">
                <Navigation className="w-4! h-4! text-[#27427f]! shrink-0!" />
                <div className="min-w-0!">
                  {c.label && <p className="text-[13px]! font-bold! text-gray-900! truncate!">{c.label}</p>}
                  {c.detail && <p className="text-[12px]! text-gray-500! truncate!">{c.detail}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {nearby.length > 0 && (
        <div className="mb-6!">
          <h3 className="text-base! font-bold! text-gray-900! mb-3!">Nearby Places</h3>
          <div className="grid! grid-cols-1! sm:grid-cols-2! lg:grid-cols-3! gap-4!">
            {nearby.map((cat, i) => (
              <div key={i} className="rounded-xl! border! border-gray-100! bg-gray-50/60! p-4!">
                <p className="flex! items-center! gap-2! text-[12px]! font-bold! uppercase! tracking-wider! text-gray-500! mb-2!">
                  <MapPinned className="w-3.5! h-3.5!" />
                  {cat.title || `Category ${i + 1}`}
                </p>
                <ul className="space-y-1.5!">
                  {(cat.places ?? []).map((pl, j) => (
                    <li key={j} className="flex! items-center! justify-between! gap-2! text-[13px]!">
                      <span className="text-gray-800! font-medium! truncate!">{pl.name}</span>
                      {pl.distance && <span className="text-gray-400! shrink-0! tabular-nums!">{pl.distance}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="rounded-xl! overflow-hidden! border! border-gray-100!">
        <LocalityInteractiveMap query={query} label={label} height={320} />
      </div>
    </section>
  );
}
