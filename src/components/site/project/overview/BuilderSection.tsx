import { Building2 } from "lucide-react";
import { RequestButton } from "@/components/site/project/RequestButton";
import type { ProjectDetail } from "@/lib/api/projects";
import { paragraphs } from "@/components/site/project/project-ui";
import { HAIRLINE, INK, MUTED, PROSE, Panel, PanelEmpty } from "@/components/site/project/overview/overview-ui";

/**
 * The developer behind the project: logo, track record and their own words.
 * Falls back to the bare name when the CRM has a builder name but no linked
 * builder profile, which is common for older projects.
 */
export function BuilderSection({ project }: { project: ProjectDetail }) {
  const builder = project.builder;
  const name = builder?.name || project.builderName;
  if (!name) {
    return (
      <Panel title="About the developer" id="builder">
        <PanelEmpty
          icon={Building2}
          title="Developer details aren't published yet"
          body="Ask for the developer's track record and the projects they've delivered."
          action={
            <RequestButton
              label="Ask about the developer"
              message={`Who is developing ${project.name}, and what have they delivered before?`}
            />
          }
        />
      </Panel>
    );
  }

  const stats = [
    builder?.experienceYears
      ? { value: `${builder.experienceYears}+`, label: "Years building" }
      : null,
    builder?.completedProjects
      ? { value: `${builder.completedProjects}`, label: "Projects delivered" }
      : null,
    builder?.ongoingProjects
      ? { value: `${builder.ongoingProjects}`, label: "Under way" }
      : null,
  ].filter((stat): stat is { value: string; label: string } => stat !== null);

  return (
    <Panel title={`About ${name}`} id="builder">
      <div className={`mt-6! grid! grid-cols-1! gap-8! ${stats.length > 0 ? "md:grid-cols-[minmax(0,1fr)_auto]! md:gap-12!" : ""}`}>
        <div className="min-w-0!">
          {builder?.logoUrl && (
            /* Raw <img>, as everywhere else storage-backed assets are rendered:
               generateReadUrl hands back a signed URL whose query string rotates,
               so next/image would miss its cache on every request. */
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={builder.logoUrl}
              alt={`${name} logo`}
              loading="lazy"
              decoding="async"
              className="mb-5! h-12! w-auto! max-w-44! object-contain! object-left! rounded-lg!"
            />
          )}
          {builder?.description && builder.description.trim() ? (
            <div className="flex! flex-col! gap-4!">
              {paragraphs(builder.description).map((block, index) => (
                <p key={index} className={`m-0! ${PROSE} whitespace-pre-line!`}>
                  {block}
                </p>
              ))}
            </div>
          ) : (
            <p className={`m-0! ${PROSE}`}>
              {name} is the developer of record for this project. Ask us for their
              delivery history and ongoing projects.
            </p>
          )}
        </div>

        {/* The track record as three large numbers, ruled like a ledger. */}
        {stats.length > 0 && (
          <dl className={`m-0! grid! grid-cols-3! md:grid-cols-1! md:min-w-48! border-t! md:border-t-0! md:border-l! ${HAIRLINE}`}>
            {stats.map((stat, index) => (
              /* dt must precede dd inside a dl group; column-reverse puts the
                 number on top visually without breaking that order. */
              <div
                key={stat.label}
                className={`flex! flex-col-reverse! gap-1! pt-4! md:pt-0! md:pl-8! ${index > 0 ? "md:pt-5!" : ""} ${
                  index < stats.length - 1 ? `md:pb-5! md:border-b! ${HAIRLINE}` : ""
                }`}
              >
                <dt className={`text-[13px]! ${MUTED}`}>{stat.label}</dt>
                <dd className={`m-0! text-3xl! md:text-4xl! font-semibold! tracking-[-0.04em]! leading-none! tabular-nums! ${INK}`}>
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </Panel>
  );
}
