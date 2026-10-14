import { Grid3X3 } from "lucide-react";
import { RequestButton } from "@/components/site/project/RequestButton";
import type { ProjectDetail } from "@/lib/api/projects";
import { getFloorPlanLabel } from "@/lib/property-sections";
import { groupUnitsByConfiguration, projectFloorPlanHref, unitFloorPlans } from "@/lib/project-overview";
import { unitAreaLabel } from "@/lib/project-config-summary";
import { Panel, PanelEmpty, PanelLink } from "@/components/site/project/overview/overview-ui";
import { FloorPlanViewer, type PlanPreview } from "@/components/site/project/overview/FloorPlanViewer";

/** Enough to show the range of plans without turning the overview into a gallery. */
const MAX_PREVIEWS = 6;

export function FloorPlanPreview({ project }: { project: ProjectDetail }) {
  // One plan per configuration, so the preview shows each type once rather
  // than whichever flats happen to have a plan uploaded first.
  const previews = groupUnitsByConfiguration(project)
    .flatMap((group) => {
      const seenConfigurations = new Set<string>();
      return group.units.flatMap((unit) => {
        const area = unitAreaLabel(unit, project.projectType);
        const configuration = area || unit.title?.trim() || unit.unitCode || String(unit.id);
        if (seenConfigurations.has(configuration)) return [];
        const floor = unitFloorPlans(unit)[0];
        if (floor) seenConfigurations.add(configuration);
        return floor ? [{ group, unit, floor, configuration }] : [];
      });
    })
    .slice(0, MAX_PREVIEWS);

  const slug = project.canonicalSlug;
  const planNoun = getFloorPlanLabel(project.projectType).toLowerCase();
  const plural = `${planNoun}s`;
  const title = `${plural.charAt(0).toUpperCase()}${plural.slice(1)}`;

  if (previews.length === 0) {
    const isPlot = project.projectType === "plot";
    return (
      <Panel title={title} id="floor-plans">
        <PanelEmpty
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
      </Panel>
    );
  }

  const plans: PlanPreview[] = previews.map(({ group, unit, floor, configuration }) => ({
    key: `${group.key}-${unit.id}`,
    label: group.label,
    configuration,
    area: unitAreaLabel(unit, project.projectType),
    floorName: floor.floorName,
    src: floor.imageUrl,
    href: projectFloorPlanHref(slug, unit.id, floor.floorName),
    alt: `${group.label} ${configuration} ${floor.floorName} ${planNoun} for ${project.name}`,
  }));

  return (
    <Panel
      title={title}
      id="floor-plans"
      action={<PanelLink href={`/${slug}/floor-plans`}>All {plural}</PanelLink>}
    >
      <FloorPlanViewer plans={plans} />
    </Panel>
  );
}
