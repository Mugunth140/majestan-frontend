import type { ProjectDetail } from "@/lib/api/projects";
import { buildFacts } from "@/lib/project-overview";
import { ProjectGallery } from "@/components/site/project/ProjectGallery";
import {
  ProjectShell,
  ProjectTitleRow,
} from "@/components/site/project/ProjectShell";
import { PAGE_CONTAINER } from "@/components/site/project/project-ui";
import { OV_ROOT } from "@/components/site/project/overview/overview-ui";
import { AboutSection } from "@/components/site/project/overview/AboutSection";
import { ConfigurationSummary } from "@/components/site/project/overview/ConfigurationSummary";
import { FloorPlanPreview } from "@/components/site/project/overview/FloorPlanPreview";
import { SpecsHighlights } from "@/components/site/project/overview/SpecsHighlights";
import { MediaPreview } from "@/components/site/project/overview/MediaPreview";
import { LocationOverview } from "@/components/site/project/overview/LocationOverview";
import { AmenitiesPreview } from "@/components/site/project/overview/AmenitiesPreview";
import { FurnishingSection } from "@/components/site/project/overview/FurnishingSection";
import { BuilderSection } from "@/components/site/project/overview/BuilderSection";
import { CalculatorsSection } from "@/components/site/project/overview/CalculatorsSection";
import { FaqOverview } from "@/components/site/project/overview/FaqOverview";
import { ProjectHelpSection } from "@/components/site/project/overview/ProjectHelpSection";

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
    <div className={`${OV_ROOT} ${PAGE_CONTAINER} w-full! flex! flex-col! gap-6!`}>
      {/* Keyed by project: the gallery's position must not ride along
          across client-side project-to-project navigation. */}
      <ProjectGallery key={project.canonicalSlug} project={project} />

      <ProjectTitleRow project={project} heading={heading} />

      {/* The decision band. Each of these numbers appears exactly once on the
          page — the about section's details deliberately carry none. Two up
          on a phone, one row with hairline dividers from md. */}
      <section
        aria-label="Key facts"
        className="rounded-2xl! overflow-hidden! border! border-[#dfe7f4]! bg-[linear-gradient(120deg,#fff_0%,#f7faff_45%,#e8f0ff_100%)]! shadow-[0_1px_2px_rgba(10,15,28,0.03)]!"
      >
        <dl className="m-0! grid! grid-cols-2! md:grid-flow-col! md:auto-cols-fr! md:grid-cols-none!">
          {facts.map((fact, index) => (
            <div
              key={fact.label}
              className={`min-w-0! px-5! py-5! md:px-7! md:py-6! border-[#dfe7f4]! ${
                index % 2 === 1 ? "border-l!" : ""
              } ${index >= 2 ? "border-t! md:border-t-0!" : ""} ${index > 0 ? "md:border-l!" : ""}`}
            >
              <dt className="text-[11px]! font-semibold! uppercase! tracking-[0.08em]! text-[#1645bf]/75!">
                {fact.label}
              </dt>
              <dd className="m-0! mt-2! text-lg! md:text-[22px]! font-semibold! tracking-[-0.02em]! leading-tight! text-[#0a0f1c]! tabular-nums! break-words!">
                {fact.value}
              </dd>
              {fact.note && <dd className="m-0! mt-1! text-xs! text-[#5f6b80]!">{fact.note}</dd>}
            </div>
          ))}
        </dl>
      </section>

      <ProjectShell project={project}>
        <AboutSection project={project} />
        <ConfigurationSummary project={project} />
        <FloorPlanPreview project={project} />
        <SpecsHighlights project={project} />
        <AmenitiesPreview project={project} />
        <FurnishingSection project={project} />
        <MediaPreview project={project} />
        <LocationOverview project={project} />
        <BuilderSection project={project} />
        <CalculatorsSection project={project} />
        <FaqOverview project={project} />
        <ProjectHelpSection projectName={project.name} />
      </ProjectShell>
    </div>
  );
}
