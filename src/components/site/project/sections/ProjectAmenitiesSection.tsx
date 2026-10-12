import type { ProjectDetail } from "@/lib/api/projects";
import { BODY, Card } from "@/components/site/project/project-ui";
import {
  AMENITY_GRID,
  AmenityTile,
  amenityGroups,
  amenityList,
  categoryAnchor,
} from "@/components/site/project/overview/amenity-parts";

/**
 * Amenities grouped by CRM category, one card per group, each with an anchor
 * the overview's category chips link to. The overview shows a preview; this
 * page holds the full list.
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

  return (
    <div className="flex! flex-col! gap-6!">
      {amenityGroups(items).map(([title, list]) => (
        <Card
          key={title}
          title={title}
          id={categoryAnchor(title)}
          action={
            <span className="shrink-0! text-sm! text-gray-500! tabular-nums!">
              {list.length} {list.length === 1 ? "amenity" : "amenities"}
            </span>
          }
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
