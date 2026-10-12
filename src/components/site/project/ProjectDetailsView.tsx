import type { ProjectDetail } from "@/lib/api/projects";
import { buildFacts } from "@/lib/project-overview";
import { ProjectGallery } from "@/components/site/project/ProjectGallery";
import {
  ProjectShell,
  ProjectTitleRow,
} from "@/components/site/project/ProjectShell";
import { LABEL, PAGE_CONTAINER } from "@/components/site/project/project-ui";
import { AboutSection } from "@/components/site/project/overview/AboutSection";
import { ConfigurationSummary } from "@/components/site/project/overview/ConfigurationSummary";
import { FloorPlanPreview } from "@/components/site/project/overview/FloorPlanPreview";
import { SpecsHighlights } from "@/components/site/project/overview/SpecsHighlights";
import { MediaPreview } from "@/components/site/project/overview/MediaPreview";
import { LocationOverview } from "@/components/site/project/overview/LocationOverview";
import { AmenitiesPreview } from "@/components/site/project/overview/AmenitiesPreview";
import { FurnishingSection } from "@/components/site/project/overview/FurnishingSection";
import { BuilderSection } from "@/components/site/project/overview/BuilderSection";
import { FaqOverview } from "@/components/site/project/overview/FaqOverview";

/**
 * The project overview: the main page for a project.
 *
 * Three bands, all in the page column. The cover and, under it, the title with
 * the brochure and the numbers a buyer decides on run the column's full width.
 * Then sections down the left with the enquiry card beside them, starting
 * level with About.
 *
 * Every section always renders. Each topic shows its important details here
 * and hands the rest to its sub-page; when the CRM has nothing for a topic,
 * the section says so and offers to request it, rather than vanishing and
 * leaving the buyer to wonder whether they missed it.
 */
export function ProjectDetailsView({ project }: { project: ProjectDetail }) {
  const heading = project.seo?.seoData?.overview?.h1 || project.name;
  const facts = buildFacts(project);

  return (
    <div className={`${PAGE_CONTAINER} w-full! flex! flex-col! gap-6!`}>
      <ProjectGallery project={project} />

      <ProjectTitleRow project={project} heading={heading} />

      {/* The decision band. Each of these numbers appears exactly once on the
          page — the about section's spec sheet deliberately carries none.
          Two up on a phone, one divided row from sm. */}
      <section
        aria-label="Key facts"
        className="bg-white! rounded-[20px]! border! border-gray-200/70! shadow-sm! overflow-hidden! grid! grid-cols-2! gap-x-6! gap-y-5! p-6! sm:flex! sm:gap-0! sm:p-0! sm:divide-x! sm:divide-gray-200!"
      >
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="min-w-0! sm:flex-1! sm:px-6! sm:py-4!"
          >
            <p className={LABEL}>{fact.label}</p>
            <p className="mt-1! text-base! md:text-lg! font-semibold! text-gray-900! tabular-nums! break-words!">
              {fact.value}
            </p>
            {fact.note && (
              <p className="mt-1! text-xs! text-gray-500!">{fact.note}</p>
            )}
          </div>
        ))}
      </section>

      <ProjectShell project={project}>
        <AboutSection project={project} />
        <ConfigurationSummary project={project} />
        <FloorPlanPreview project={project} />
        <SpecsHighlights project={project} />
        <MediaPreview project={project} />
        <LocationOverview project={project} />
        <AmenitiesPreview project={project} />
        <FurnishingSection project={project} />
        <BuilderSection project={project} />
        <FaqOverview project={project} />
      </ProjectShell>
    </div>
  );
}
