import Link from "next/link";
import { Grid3X3 } from "lucide-react";
import { RequestButton } from "@/components/site/project/RequestButton";
import type { ProjectDetail } from "@/lib/api/projects";
import { getFloorPlanLabel } from "@/lib/property-sections";
import { groupUnitsByConfiguration } from "@/lib/project-overview";
import { unitAreaLabel } from "@/lib/project-config-summary";
import { Card, EmptyState, ViewAllLink } from "@/components/site/project/project-ui";
import { CONFIGURATION_TILE } from "@/components/site/project/overview/ConfigurationSummary";

/** Enough to show the range of plans without turning the overview into a gallery. */
const MAX_PREVIEWS = 4;

export function FloorPlanPreview({ project }: { project: ProjectDetail }) {
  // One plan per configuration, so the preview shows each type once rather
  // than whichever flats happen to have a plan uploaded first.
  const previews = groupUnitsByConfiguration(project)
    .flatMap((group) => {
      const unit = group.units.find((u) => u.floorPlanImageUrl);
      return unit?.floorPlanImageUrl
        ? [{ group, unit, planUrl: unit.floorPlanImageUrl }]
        : [];
    })
    .slice(0, MAX_PREVIEWS);

  const slug = project.canonicalSlug;
  const planNoun = getFloorPlanLabel(project.projectType).toLowerCase();
  const plural = `${planNoun}s`;
  const title = `${plural.charAt(0).toUpperCase()}${plural.slice(1)}`;

  if (previews.length === 0) {
    const isPlot = project.projectType === "plot";
    return (
      <Card title={title} id="floor-plans">
        <EmptyState
          icon={Grid3X3}
          title={`${title} aren't published yet`}
          body={
            isPlot
              ? "We can send the layout with plot dimensions and road access."
              : "We can send the layout for each configuration, with room sizes."
          }
          action={
            <RequestButton
              label={`Request ${plural}`}
              message={`Please send the ${plural} for ${project.name}.`}
            />
          }
        />
      </Card>
    );
  }

  return (
    <Card
      title={title}
      id="floor-plans"
      action={<ViewAllLink href={`/${slug}/floor-plans`}>View all</ViewAllLink>}
    >
      <div className="grid! grid-cols-1! sm:grid-cols-2! gap-4! mt-6!">
        {previews.map(({ group, unit, planUrl }) => {
          const area = unitAreaLabel(unit, project.projectType);
          return (
            <Link
              key={group.key}
              href={`/${slug}/floor-plans#${group.key}`}
              className={CONFIGURATION_TILE}
            >
              <div className="bg-gray-50! aspect-[4/3]!">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={planUrl}
                  alt={`${group.label} ${planNoun} for ${project.name}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full! h-full! object-contain! p-4!"
                />
              </div>

              <div className="px-4! py-3!">
                <p className="text-sm! font-semibold! text-gray-900!">{group.label}</p>
                {area && <p className="text-sm! text-gray-500! tabular-nums!">{area}</p>}
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
