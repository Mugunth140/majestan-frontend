import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { ProjectDetail } from "@/lib/api/projects";
import { Card, EmptyState, ViewAllLink } from "@/components/site/project/project-ui";
import { RequestButton } from "@/components/site/project/RequestButton";
import {
  AMENITY_GRID,
  AmenityTile,
  amenityGroups,
  amenityList,
  categoryAnchor,
} from "@/components/site/project/overview/amenity-parts";

/** Two rows at the widest grid. */
const PREVIEW_COUNT = 8;

const CHIP =
  "inline-flex! items-center! gap-1.5! rounded-full! bg-white! px-3! py-1! text-xs! font-medium! text-gray-700! ring-1! ring-gray-200! no-underline! transition-[color,box-shadow]! duration-150! ease-out-quint! hover:text-[#27427f]! hover:ring-[#27427f]/40! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]!";

/**
 * Overview preview of the amenities: how many and of what kinds, then the
 * first eight. Each category chip and the "+N more" tile lead into the
 * amenities page, which groups the full list.
 */
export function AmenitiesPreview({ project }: { project: ProjectDetail }) {
  const items = amenityList(project);
  const count = items.length;
  const slug = project.canonicalSlug;

  if (count === 0) {
    return (
      <Card title="Amenities" id="amenities">
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
      </Card>
    );
  }

  const groups = amenityGroups(items);
  // Past eight, the last slot becomes the way to the rest rather than a ninth tile.
  const overflow = count > PREVIEW_COUNT;
  const shown = overflow ? items.slice(0, PREVIEW_COUNT - 1) : items;

  return (
    <Card
      title="Amenities"
      id="amenities"
      action={
        <ViewAllLink href={`/${slug}/amenities`}>
          {count > PREVIEW_COUNT ? `View all ${count}` : "View all"}
        </ViewAllLink>
      }
    >
      <div className="mt-4! flex! flex-wrap! items-center! gap-2!">
        <span className="mr-1! text-sm! text-gray-600!">
          {count} {count === 1 ? "amenity" : "amenities"}
          {groups.length > 1 ? ` in ${groups.length} categories` : ""}
        </span>
        {groups.length > 1 &&
          groups.map(([title, list]) => (
            <Link key={title} href={`/${slug}/amenities#${categoryAnchor(title)}`} className={CHIP}>
              {title}
              <span className="text-gray-500! tabular-nums!">{list.length}</span>
            </Link>
          ))}
      </div>

      <div className={`${AMENITY_GRID} mt-6!`}>
        {shown.map((item) => (
          <AmenityTile key={item.key} name={item.name} Icon={item.Icon} />
        ))}
        {overflow && (
          <Link
            href={`/${slug}/amenities`}
            className="flex! flex-col! justify-center! gap-1! rounded-2xl! bg-[#27427f]/5! p-4! no-underline! transition-colors! duration-150! ease-out-quint! hover:bg-[#27427f]/10! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]!"
          >
            <span className="text-xl! font-semibold! text-[#27427f]! tabular-nums!">
              +{count - shown.length}
            </span>
            <span className="text-sm! font-medium! text-[#27427f]!">more amenities</span>
          </Link>
        )}
      </div>
    </Card>
  );
}
