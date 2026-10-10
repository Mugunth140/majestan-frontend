import { Shield, Sparkles } from "lucide-react";
import type { ProjectDetail } from "@/lib/api/projects";
import { getIconForAmenity } from "@/components/site/property/sections/AmenitiesSection";
import { NeedMoreDetails } from "@/components/site/property/NeedMoreDetails";
import { connectivityIconFor } from "@/components/site/project/connectivity-icons";

type Amenity = {
  name: string;
  icon: React.ElementType;
};

type AmenityCategory = {
  title: string;
  description: string;
  amenities: Amenity[];
};

function getProjectAmenityCategories(project: ProjectDetail): AmenityCategory[] {
  const backendAmenities = project.projectAmenities ?? [];
  if (backendAmenities.length === 0) return [];

  const grouped: Record<string, Amenity[]> = {};
  backendAmenities.forEach((pa: any) => {
    const am = pa.amenity;
    if (!am || !am.name) return;
    const catName = am.category || "other";
    const title = catName.charAt(0).toUpperCase() + catName.slice(1);
    if (!grouped[title]) grouped[title] = [];
    grouped[title].push({
      name: am.name,
      icon: am.icon ? connectivityIconFor(am.icon) : getIconForAmenity(am.name),
    });
  });

  return Object.entries(grouped).map(([title, amenities]) => ({
    title: title.replace(/-/g, " "),
    description: `Features in ${title.toLowerCase()}`,
    amenities,
  }));
}

function AmenityCard({ amenity }: { amenity: Amenity }) {
  const Icon = amenity.icon;
  return (
    <div className="group flex! items-center! gap-4! p-4! rounded-2xl! bg-white! border! border-gray-200/70! hover:border-[#27427f]/30! hover:shadow-[0_8px_24px_rgba(39,66,127,0.10)]! hover:-translate-y-0.5! transition-all! duration-300!">
      <div className="w-12! h-12! rounded-xl! bg-[#27427f]/10! flex! items-center! justify-center! shrink-0!">
        <Icon className="w-5! h-5! text-[#27427f]!" strokeWidth={1.75} />
      </div>
      <span className="font-manrope! font-semibold! text-base! text-gray-700! flex-1!">
        {amenity.name}
      </span>
    </div>
  );
}

export function ProjectAmenitiesSection({ project }: { project: ProjectDetail }) {
  const categories = getProjectAmenityCategories(project);

  return (
    <div className="space-y-8!">
      {categories.length === 0 ? (
        <div className="bg-white! rounded-3xl! p-12! border! border-gray-100! text-center!">
          <div className="w-20! h-20! rounded-2xl! bg-gray-50! flex! items-center! justify-center! mx-auto! mb-6!">
            <Shield className="w-8! h-8! text-gray-300!" strokeWidth={1.5} />
          </div>
          <h3 className="font-manrope! text-xl! font-semibold! text-gray-900! mb-2!">No Amenities Listed</h3>
          <p className="text-gray-500! max-w-md! mx-auto! leading-relaxed!">
            Specific amenities and features have not been listed for {project.name} yet. Please contact us for more detailed information.
          </p>
        </div>
      ) : (
        <div className="bg-white! rounded-4xl! p-8! md:p-10! border! border-gray-100! shadow-sm!">
          <div className="mb-10!">
            <h2 className="font-manrope! text-2xl! md:text-3xl! font-semibold! text-gray-900! mb-2! tracking-tight!">
              Amenities &amp; Features
            </h2>
            <p className="text-gray-500! text-base! leading-relaxed!">
              Explore the premium facilities available at <span className="font-medium! text-gray-800!">{project.name}</span>
            </p>
          </div>

          <div className="space-y-10!">
            {categories.map((category) => (
              <div key={category.title} className="pt-6! border-t! border-gray-200! first:border-0! first:pt-0!">
                <div className="mb-6!">
                  <h3 className="font-manrope! text-xl! font-semibold! text-gray-900! capitalize! tracking-relaxed!">
                    {category.title}
                  </h3>
                </div>
                <div className="grid! grid-cols-2! lg:grid-cols-3! gap-4! md:gap-5!">
                  {category.amenities.map((amenity) => (
                    <AmenityCard key={amenity.name} amenity={amenity} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <NeedMoreDetails propertyType={project.projectType} />
    </div>
  );
}
