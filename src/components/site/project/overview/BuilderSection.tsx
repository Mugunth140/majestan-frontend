import { Building2, ExternalLink, Globe } from "lucide-react";
import { RequestButton } from "@/components/site/project/RequestButton";
import type { ProjectDetail } from "@/lib/api/projects";
import { BODY, Card, EmptyState, LABEL, TEXT_LINK, paragraphs } from "@/components/site/project/project-ui";

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
      <Card title="About the developer" id="builder">
        <EmptyState
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
      </Card>
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

  const website = builder?.website
    ? builder.website.startsWith("http")
      ? builder.website
      : `https://${builder.website}`
    : null;

  return (
    <Card
      title={`About ${name}`}
      id="builder"
      action={
        website ? (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className={`shrink-0! inline-flex! items-center! gap-1.5! text-sm! font-medium! ${TEXT_LINK}`}
          >
            <Globe className="w-4! h-4!" aria-hidden="true" />
            Website
            <ExternalLink className="w-3! h-3!" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        ) : undefined
      }
    >
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
          className="mt-6! h-10! w-auto! max-w-40! object-contain! object-left!"
        />
      )}

      {stats.length > 0 && (
        <dl className="mt-6! flex! flex-col! divide-y! divide-gray-200! sm:flex-row! sm:divide-y-0! sm:divide-x! border-y! border-gray-200!">
          {stats.map((stat) => (
            /* dt must precede dd inside a dl group; column-reverse puts the
               number on top visually without breaking that order. */
            <div
              key={stat.label}
              className="flex-1! flex! flex-col-reverse! gap-1! py-4! sm:px-6! sm:first:pl-0!"
            >
              <dt className={LABEL}>{stat.label}</dt>
              <dd className="text-xl! font-semibold! text-gray-900! tabular-nums!">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {builder?.description && builder.description.trim() ? (
        <div className="mt-6! flex! flex-col! gap-4!">
          {paragraphs(builder.description).map((block, index) => (
            <p key={index} className={`${BODY} text-pretty! whitespace-pre-line!`}>
              {block}
            </p>
          ))}
        </div>
      ) : (
        <p className={`mt-6! ${BODY}`}>
          {name} is the developer of record for this project. Ask us for their
          delivery history and ongoing projects.
        </p>
      )}
    </Card>
  );
}
