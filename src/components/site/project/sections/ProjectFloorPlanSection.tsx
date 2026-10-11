import type { ProjectDetail } from "@/lib/api/projects";
import { getFloorPlanLabel } from "@/lib/property-sections";
import { ProjectConfigurations } from "@/components/site/project/ProjectConfigurations";
import { BODY, Card } from "@/components/site/project/project-ui";

/**
 * The sub-page body. The page shell already provides the title and the
 * enquiry aside, so this section is only the configuration switcher. The
 * overview's configuration cards link here with a hash, which the switcher
 * reads to open on the right tab.
 */
export function ProjectFloorPlanSection({ project }: { project: ProjectDetail }) {
  if (project.units.length === 0) {
    return (
      <Card title={`${getFloorPlanLabel(project.projectType).replace("Plan", "plans")}`} id="floor-plans">
        <p className={`${BODY} mt-6!`}>
          Plans for this project have not been published yet. Send an enquiry and our team
          will share them.
        </p>
      </Card>
    );
  }

  return (
    <Card title="Configurations" id="configurations">
      <div className="mt-6!">
        <ProjectConfigurations project={project} />
      </div>
    </Card>
  );
}
