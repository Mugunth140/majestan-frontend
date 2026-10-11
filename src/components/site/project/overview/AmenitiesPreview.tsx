import { Sparkles } from "lucide-react";
import type { ProjectDetail } from "@/lib/api/projects";
import { Card, EmptyState, ViewAllLink } from "@/components/site/project/project-ui";
import { RequestButton } from "@/components/site/project/RequestButton";
import {
  AMENITY_GRID,
  AmenityTile,
  amenityList,
} from "@/components/site/project/overview/amenity-parts";

/** Two rows at the widest grid. */
const PREVIEW_COUNT = 8;

/**
 * Overview preview of the amenities. The link always shows when there is a
 * list: the sub-page groups the whole set by category, which a preview cannot.
 */
export function AmenitiesPreview({ project }: { project: ProjectDetail }) {
  const items = amenityList(project);
  const count = items.length;

  return (
    <Card
      title="Amenities"
      id="amenities"
      action={
        count > 0 ? (
          <ViewAllLink href={`/${project.canonicalSlug}/amenities`}>
            {count > PREVIEW_COUNT ? `View all ${count}` : "View all"}
          </ViewAllLink>
        ) : undefined
      }
    >
      {count > 0 ? (
        <div className={`${AMENITY_GRID} mt-6!`}>
          {items.slice(0, PREVIEW_COUNT).map((item) => (
            <AmenityTile key={item.key} name={item.name} Icon={item.Icon} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Sparkles}
          title="Amenities aren't listed yet"
          body="Ask for the full list of shared facilities and services."
          action={
            <RequestButton
              label="Request amenity list"
              message={`Please share the full amenity list for ${project.name}.`}
            />
          }
        />
      )}
    </Card>
  );
}
