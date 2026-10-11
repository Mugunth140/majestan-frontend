import type { ProjectDetail } from "@/lib/api/projects";
import { BODY, Card } from "@/components/site/project/project-ui";
import { AMENITY_GRID, AmenityTile, amenityList, type AmenityItem } from "@/components/site/project/overview/amenity-parts";

const OTHER = "Other";

/** "security" becomes "Security", and "multi_purpose" becomes "Multi Purpose". */
function categoryTitle(raw: string | null): string {
  const words = (raw ?? "")
    .replace(/[-_]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return OTHER;
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

/**
 * Amenities grouped by CRM category, one card per group. The overview shows
 * only the first eight tiles; this page is where the full list lives.
 */
export function ProjectAmenitiesSection({ project }: { project: ProjectDetail }) {
  const items = amenityList(project);

  if (items.length === 0) {
    return (
      <Card title="Amenities" id="amenities">
        <p className={`mt-4! ${BODY}`}>
          Amenities for this project have not been listed yet. Send an enquiry and our team will
          share the full list.
        </p>
      </Card>
    );
  }

  const groups = new Map<string, AmenityItem[]>();
  for (const item of items) {
    const title = categoryTitle(item.category);
    groups.set(title, [...(groups.get(title) ?? []), item]);
  }

  // Alphabetical, with Other last so the catch-all never leads the page.
  const ordered = [...groups.entries()].sort(([a], [b]) => {
    if (a === OTHER) return 1;
    if (b === OTHER) return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="flex! flex-col! gap-6!">
      {ordered.map(([title, list]) => (
        <Card
          key={title}
          title={title}
          id={`amenities-${title.toLowerCase().replace(/\s+/g, "-")}`}
        >
          <div className={`${AMENITY_GRID} mt-6!`}>
            {list.map((item) => (
              <AmenityTile key={item.key} name={item.name} Icon={item.Icon} />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
