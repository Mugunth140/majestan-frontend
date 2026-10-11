import Link from "next/link";
import {
  Check,
  Download,
  ExternalLink,
  Globe,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import type { ProjectDetail } from "@/lib/api/projects";
import {
  amenityNames,
  buildDetailRows,
  buildFacts,
  priceRangeLabel,
  rateFact,
} from "@/lib/project-overview";
import { getIconForAmenity } from "@/components/site/property/sections/AmenitiesSection";
import { FaqSection } from "@/components/site/property/sections/FaqSection";
import { LocalityTeaser } from "@/components/site/locality/LocalityTeaser";
import { NeedMoreDetails } from "@/components/site/property/NeedMoreDetails";
import { ProjectEnquiryActions } from "@/components/site/project/ProjectEnquiryActions";
import { ProjectGallery } from "@/components/site/project/ProjectGallery";
import { ProjectTopActions } from "@/components/site/project/ProjectTopActions";
import { ProjectUnitsTable } from "@/components/site/project/ProjectUnitsTable";

/** How many amenities the overview shows before deferring to the sub-page. */
const AMENITY_PREVIEW = 8;

const CARD =
  "bg-white! rounded-card! border! border-gray-200/70! shadow-sm! p-6! md:p-8!";
/* Matches FaqSection and LocalityTeaser, which this page also renders. A
   heavier heading here would have made those two look like a different page. */
const HEADING = "text-lg! md:text-xl! font-normal! text-gray-900!";
/* gray-400 was the label colour everywhere on the old page — 2.8:1 on white,
   under the 4.5:1 floor for text this size. gray-500 clears it at 4.6:1. */
const LABEL = "text-xs! font-medium! uppercase! tracking-wide! text-gray-500!";
const VALUE = "text-sm! font-semibold! text-gray-900!";
const BODY = "text-base! text-gray-600! leading-relaxed!";

/** CRM free text arrives newline separated. Blank lines are paragraph breaks. */
function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);
}

/** Single newlines in a highlights field mean "list", not "paragraph". */
function bulletLines(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.replace(/^[-•*\s]+/, "").trim())
    .filter(Boolean);
}

function Card({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className={CARD}>
      <div className="flex! items-center! justify-between! gap-4!">
        <h2 className={HEADING}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Full-bleed hairline, so dividers never read as a half-bordered block. */
function Divider() {
  return <div className="my-6! h-px! bg-gray-200!" aria-hidden="true" />;
}

function Subheading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base! font-semibold! text-gray-900!">{children}</h3>
  );
}

function DefinitionGrid({
  rows,
  columns = 3,
}: {
  rows: { label: string; value: string }[];
  columns?: 2 | 3;
}) {
  return (
    <dl
      className={`grid! grid-cols-2! ${
        columns === 3 ? "sm:grid-cols-3!" : "sm:grid-cols-2!"
      } gap-x-6! gap-y-6!`}
    >
      {rows.map((row) => (
        <div key={row.label} className="min-w-0!">
          <dt className={LABEL}>{row.label}</dt>
          <dd className={`${VALUE} mt-1! break-words!`}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ProjectDetailsView({ project }: { project: ProjectDetail }) {
  const heading = project.seo?.seoData?.overview?.h1 || project.name;
  const facts = buildFacts(project);
  const detailRows = buildDetailRows(project);
  const amenities = amenityNames(project);
  const rate = rateFact(project);
  const isPlot = project.projectType === "plot";

  const street = (project.address || "").trim();
  const region = [project.sublocation, project.city, project.state, project.pincode]
    .filter(Boolean)
    .join(", ");

  const towerRows = (project.towerDetails ?? []).filter(
    (tower) => tower.tower || tower.floors || tower.units,
  );
  const specifications = (project.specifications ?? []).filter(
    (spec) => spec.label && spec.value,
  );
  const highlightLines = bulletLines((project.highlights || "").trim());

  const builder = project.builder;
  const builderName = builder?.name || project.builderName;
  const builderStats = [
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
  const builderWebsite = builder?.website
    ? builder.website.startsWith("http")
      ? builder.website
      : `https://${builder.website}`
    : null;

  return (
    <div className="flex! flex-col! gap-6!">
      <ProjectTopActions project={project} />

      {/* Identity sits on the page ground rather than over the cover photo. A
          scrim dark enough to carry an h1 over an unknown photograph ruins the
          photograph, and these three facts used to appear twice: once on the
          image and again at the top of the sidebar, as a second h1. */}
      <header>
        <h1 className="text-3xl! md:text-4xl! font-semibold! text-gray-900! tracking-tight! leading-tight! text-balance!">
          {heading}
        </h1>
        {(street || region) && (
          <p className="mt-2! flex! items-start! gap-2! text-base! text-gray-600!">
            <MapPin className="w-5! h-5! shrink-0! mt-0.5! text-gray-500!" />
            <span className="min-w-0!">
              {street && <span className="block!">{street}</span>}
              {region && (
                <span className={street ? "block! text-gray-500!" : "block!"}>
                  {region}
                </span>
              )}
            </span>
          </p>
        )}
      </header>

      <ProjectGallery project={project} />

      {/* The decision band. Each of these numbers appears exactly once on the
          page — the spec sheet below deliberately carries none of them. */}
      <section
        aria-label="Key facts"
        /* Two up on a phone, one divided row from sm. Stacking five
           full-width rows put ~375px of scrolling between the cover photo
           and the first sentence of copy. */
        className="bg-white! rounded-card! border! border-gray-200/70! shadow-sm! overflow-hidden! grid! grid-cols-2! gap-x-6! gap-y-5! p-6! sm:flex! sm:gap-0! sm:p-0! sm:divide-x! sm:divide-gray-200!"
      >
        {facts.map((fact) => (
          <div key={fact.label} className="min-w-0! sm:flex-1! sm:px-6! sm:py-4!">
            <p className={LABEL}>{fact.label}</p>
            {/* text-base on a phone: at two columns, "90.00 L - 6.00 Cr" at
                text-lg wraps onto a second line in a ~150px cell. */}
            <p className="mt-1! text-base! sm:text-lg! font-semibold! text-gray-900! tabular-nums! break-words!">
              {fact.value}
            </p>
            {fact.note && (
              <p className="mt-1! text-xs! text-gray-500!">{fact.note}</p>
            )}
          </div>
        ))}
      </section>

      <div className="grid! grid-cols-1! lg:grid-cols-3! gap-6!">
        <div className="lg:col-span-2! flex! flex-col! gap-6! min-w-0!">
          <Card title={`About ${project.name}`}>
            {project.description && project.description.trim() ? (
              <div className="mt-4! flex! flex-col! gap-4!">
                {paragraphs(project.description).map((block, index) => (
                  <p
                    key={index}
                    className={`${BODY} text-pretty! whitespace-pre-line!`}
                  >
                    {block}
                  </p>
                ))}
              </div>
            ) : (
              <p className={`mt-4! ${BODY}`}>
                A full description has not been published for this project yet.
                Send an enquiry and our team will share the details.
              </p>
            )}

            {highlightLines.length > 0 && (
              <>
                <Divider />
                <Subheading>Highlights</Subheading>
                {highlightLines.length > 1 ? (
                  <ul className="mt-4! grid! grid-cols-1! sm:grid-cols-2! gap-x-6! gap-y-3! list-none! p-0! m-0!">
                    {highlightLines.map((line, index) => (
                      <li key={index} className="flex! items-start! gap-3!">
                        <Check className="w-4! h-4! shrink-0! mt-1! text-[#27427f]!" />
                        <span className="text-sm! text-gray-700! leading-relaxed!">
                          {line}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={`mt-4! ${BODY} text-pretty!`}>
                    {highlightLines[0]}
                  </p>
                )}
              </>
            )}
          </Card>

          {project.units.length > 0 && (
            <Card title={isPlot ? "Plots and pricing" : "Configurations and pricing"}>
              <div className="mt-6!">
                <ProjectUnitsTable project={project} />
              </div>
            </Card>
          )}

          {detailRows.length > 0 && (
            <Card title="Project details">
              <div className="mt-6!">
                <DefinitionGrid rows={detailRows} />
              </div>

              {!isPlot && towerRows.length > 0 && (
                <>
                  <Divider />
                  <Subheading>Towers</Subheading>
                  <div className="mt-4! overflow-x-auto!">
                    <table className="data-table w-full! text-left! border-collapse!">
                      <thead>
                        <tr>
                          <th scope="col" className={`py-2! pr-4! ${LABEL}`}>
                            Tower
                          </th>
                          <th scope="col" className={`py-2! pr-4! ${LABEL}`}>
                            Floors
                          </th>
                          <th scope="col" className={`py-2! ${LABEL}`}>
                            Units
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {towerRows.map((tower, index) => (
                          <tr key={index} className="border-t! border-gray-200!">
                            <td className="py-3! pr-4! text-sm! font-semibold! text-gray-900!">
                              {tower.tower || `Tower ${index + 1}`}
                            </td>
                            <td className="py-3! pr-4! text-sm! text-gray-700! tabular-nums!">
                              {tower.floors ?? "—"}
                            </td>
                            <td className="py-3! text-sm! text-gray-700! tabular-nums!">
                              {tower.units ?? "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </Card>
          )}

          {/* The old overview advertised an amenities sub-page with the
              description "To be updated" while the amenity list was already in
              the payload it had fetched. */}
          {amenities.length > 0 && (
            <Card
              title="Amenities"
              action={
                amenities.length > AMENITY_PREVIEW ? (
                  <Link
                    href={`/${project.canonicalSlug}/amenities`}
                    className="shrink-0! text-sm! font-medium! text-[#27427f]! no-underline! rounded-md! transition-colors! duration-150! ease-out-quint! hover:text-[#1e3563]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]!"
                  >
                    All {amenities.length}
                  </Link>
                ) : undefined
              }
            >
              <ul className="mt-6! grid! grid-cols-2! sm:grid-cols-3! gap-x-6! gap-y-4! list-none! p-0! m-0!">
                {amenities.slice(0, AMENITY_PREVIEW).map((name) => {
                  const Icon = getIconForAmenity(name);
                  return (
                    <li key={name} className="flex! items-center! gap-3! min-w-0!">
                      <Icon
                        className="w-4! h-4! shrink-0! text-[#27427f]!"
                        strokeWidth={1.75}
                      />
                      <span className="text-sm! text-gray-700! truncate!">
                        {name}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}

          {specifications.length > 0 && (
            <Card title="Specifications">
              <div className="mt-6!">
                <DefinitionGrid rows={specifications} columns={2} />
              </div>
            </Card>
          )}

          {project.sublocation && (
            <LocalityTeaser
              locality={project.sublocation}
              city={project.city}
              localityHref={`/${project.canonicalSlug}/locality`}
            />
          )}

          {builderName && (
            <Card
              title={`About ${builderName}`}
              action={
                builderWebsite ? (
                  <a
                    href={builderWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0! inline-flex! items-center! gap-1.5! text-sm! font-medium! text-[#27427f]! no-underline! rounded-md! transition-colors! duration-150! ease-out-quint! hover:text-[#1e3563]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]!"
                  >
                    <Globe className="w-4! h-4!" />
                    Website
                    <ExternalLink className="w-3! h-3!" aria-hidden="true" />
                  </a>
                ) : undefined
              }
            >
              {builder?.logoUrl && (
                /* Raw <img>, as everywhere else storage-backed assets are
                   rendered: generateReadUrl hands back a signed URL whose
                   query string rotates, so next/image would miss its cache on
                   every request and still pay the optimizer round trip. */
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={builder.logoUrl}
                  alt={`${builderName} logo`}
                  loading="lazy"
                  decoding="async"
                  className="mt-6! h-10! w-auto! max-w-40! object-contain! object-left!"
                />
              )}

              {builderStats.length > 0 && (
                <dl className="mt-6! flex! flex-col! divide-y! divide-gray-200! sm:flex-row! sm:divide-y-0! sm:divide-x! border-y! border-gray-200!">
                  {builderStats.map((stat) => (
                    <div key={stat.label} className="flex-1! py-4! sm:px-6! sm:first:pl-0!">
                      <dd className="text-xl! font-semibold! text-gray-900! tabular-nums!">
                        {stat.value}
                      </dd>
                      <dt className={`${LABEL} mt-1!`}>{stat.label}</dt>
                    </div>
                  ))}
                </dl>
              )}

              {builder?.description && builder.description.trim() ? (
                <div className="mt-6! flex! flex-col! gap-4!">
                  {paragraphs(builder.description).map((block, index) => (
                    <p
                      key={index}
                      className={`${BODY} text-pretty! whitespace-pre-line!`}
                    >
                      {block}
                    </p>
                  ))}
                </div>
              ) : (
                <p className={`mt-6! ${BODY}`}>
                  {builderName} is the developer of record for this project. Ask
                  us for their delivery history and ongoing projects.
                </p>
              )}
            </Card>
          )}

          <FaqSection
            faqs={(project.projectFaqs ?? []).map((faq, index) => ({
              id: faq.id,
              question: faq.question,
              answer: faq.answer,
              section: "overview",
              sortOrder: faq.sortOrder ?? index,
            }))}
          />

          <NeedMoreDetails propertyType={project.projectType} />
        </div>

        {/* Only the action card now. It used to restate the name, address,
            BHK, area, possession, floors, RERA number, developer and project
            id that the main column already carried. */}
        <aside className="lg:col-span-1! min-w-0!">
          <div className="lg:sticky! lg:top-32! bg-white! rounded-card! border! border-gray-200/70! shadow-sm! p-6!">
            <p className={LABEL}>{isPlot ? "Plot price" : "Price"}</p>
            <p className="mt-1! text-2xl! font-semibold! text-gray-900! tracking-tight! tabular-nums!">
              {priceRangeLabel(project)}
            </p>
            {rate && (
              <p className="mt-1! text-sm! text-gray-500! tabular-nums!">
                {rate.value} {rate.label.replace("Rate ", "")}
                {rate.note ? ` ${rate.note}` : ""}
              </p>
            )}
            {builderName && (
              <p className="mt-3! text-sm! text-gray-600!">
                By{" "}
                <span className="font-medium! text-gray-900!">{builderName}</span>
              </p>
            )}

            <div className="mt-6!">
              <ProjectEnquiryActions project={project} />
            </div>

            {project.brochureUrl && (
              <a
                href={project.brochureUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                title={project.brochureName ?? undefined}
                className="mt-2! w-full! inline-flex! items-center! justify-center! gap-2! rounded-xl! px-4! py-3! text-sm! font-medium! text-gray-700! ring-1! ring-gray-200! no-underline! transition-[background-color,transform]! duration-150! ease-out-quint! hover:bg-gray-50! active:scale-[0.98]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]! focus-visible:ring-offset-2!"
              >
                <Download className="w-4! h-4!" />
                Download brochure
              </a>
            )}

            {project.reraNumber && (
              <p className="mt-6! pt-6! border-t! border-gray-200! flex! items-center! gap-2! text-sm! text-gray-600!">
                <ShieldCheck className="w-4! h-4! shrink-0! text-emerald-600!" />
                RERA registered
                <span className="sr-only">
                  , registration number {project.reraNumber}
                </span>
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
