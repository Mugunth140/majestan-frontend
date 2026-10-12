import Link from "next/link";
import { Sofa } from "lucide-react";
import type { ProjectDetail } from "@/lib/api/projects";
import { Card, EmptyState, TEXT_LINK, ViewAllLink } from "@/components/site/project/project-ui";
import { RequestButton } from "@/components/site/project/RequestButton";
import { AMENITY_GRID, AmenityTile } from "@/components/site/project/overview/amenity-parts";
import {
  FurnishingStatus,
  projectFurnishing,
} from "@/components/site/project/overview/furnishing-parts";

/**
 * Furnishing is recorded per unit, so the overview shows the union across all
 * units. When the units differ, a note says so: otherwise a buyer reads the
 * list as a promise for every flat. The amenities page breaks it down by
 * configuration. Plots have nothing to furnish, so they get no card.
 */
export function FurnishingSection({ project }: { project: ProjectDetail }) {
  const furnishing = projectFurnishing(project);
  if (!furnishing) return null;

  const { items, varies, sharedStatus } = furnishing;
  const href = `/${project.canonicalSlug}/amenities#furnishing`;

  // An unfurnished handover is a complete answer; anything else without an
  // item list is a gap worth asking about.
  if (items.length === 0 && sharedStatus !== "Unfurnished") {
    return (
      <Card title="Furnishing" id="furnishing">
        <FurnishingStatus furnishing={furnishing} />
        <EmptyState
          icon={Sofa}
          title="Furnishing details aren't listed yet"
          body="Ask what comes fitted in each unit, from wardrobes to the kitchen."
          action={
            <RequestButton
              label="Ask about furnishing"
              message={`What furnishing comes with the units at ${project.name}?`}
            />
          }
        />
      </Card>
    );
  }

  return (
    <Card
      title="Furnishing"
      id="furnishing"
      action={items.length > 0 ? <ViewAllLink href={href}>View details</ViewAllLink> : undefined}
    >
      <FurnishingStatus furnishing={furnishing} />
      {items.length > 0 && (
        <div className={`${AMENITY_GRID} mt-6!`}>
          {items.map((item) => (
            <AmenityTile key={item.key} name={item.name} Icon={item.Icon} />
          ))}
        </div>
      )}
      {varies && items.length > 0 && (
        <p className="text-sm! text-gray-500! mt-4!">
          Furnishing varies by configuration.{" "}
          <Link href={href} className={TEXT_LINK}>
            See what each includes
          </Link>
          .
        </p>
      )}
    </Card>
  );
}
