import type { ProjectDetail } from "@/lib/api/projects";
import { connectivityIconFor } from "@/components/site/project/connectivity-icons";
import { getIconForAmenity } from "@/components/site/property/sections/AmenitiesSection";
import { IconTile } from "@/components/site/project/overview/location-parts";

/*
 * Amenity rows shared by the overview preview and the amenities sub-page.
 * Server-safe: no hooks.
 */

export type AmenityItem = {
  key: string;
  name: string;
  Icon: React.ElementType;
  /** Raw CRM category, e.g. "security". The sub-page formats it for display. */
  category: string | null;
};

/**
 * Flat, deduped list of the project's amenities. Dedupes on the name a buyer
 * reads, not the id, so one amenity never appears twice.
 */
export function amenityList(project: ProjectDetail): AmenityItem[] {
  const seen = new Set<string>();
  const out: AmenityItem[] = [];

  for (const link of project.projectAmenities ?? []) {
    const amenity = link.amenity;
    const name = amenity?.name?.trim();
    if (!amenity || !name) continue;

    const dedupeKey = name.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    // The API sends iconKey, which the shared type does not declare yet.
    const iconKey =
      (amenity as typeof amenity & { iconKey?: string | null }).iconKey ?? amenity.icon;

    out.push({
      key: `${amenity.id}`,
      name,
      Icon: iconKey ? connectivityIconFor(iconKey) : getIconForAmenity(name),
      category: amenity.category ?? null,
    });
  }

  return out;
}

/**
 * Icon and label, no box. Eight bordered tiles inside a bordered card read
 * as a form to fill in; a light grid reads as a list to scan.
 */
export function AmenityTile({ name, Icon }: { name: string; Icon: React.ElementType }) {
  return (
    <div className="flex! items-center! gap-3! min-w-0!">
      <IconTile Icon={Icon} />
      <span className="text-sm! font-medium! text-gray-900! text-pretty!">{name}</span>
    </div>
  );
}

/** The grid every amenity-like list uses, on the overview and the sub-page. */
export const AMENITY_GRID =
  "grid! grid-cols-2! sm:grid-cols-3! lg:grid-cols-4! gap-x-6! gap-y-5!";
