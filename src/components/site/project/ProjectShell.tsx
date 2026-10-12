import { BadgeCheck, Download, MapPin } from "lucide-react";
import type { ProjectDetail } from "@/lib/api/projects";
import { ProjectAside } from "@/components/site/project/ProjectAside";

/**
 * Two-column frame shared by the overview and every sub-page: sections down
 * the left, the floating enquiry aside on the right. Sharing it is what makes
 * the sub-pages read as part of the overview rather than separate sites.
 */
export function ProjectShell({
  project,
  children,
}: {
  project: ProjectDetail;
  children: React.ReactNode;
}) {
  return (
    <div className="grid! grid-cols-1! lg:grid-cols-3! gap-6! items-stretch!">
      <div className="lg:col-span-2! flex! flex-col! gap-6! min-w-0!">{children}</div>
      <ProjectAside project={project} />
    </div>
  );
}

/**
 * The project's identity, as a two-by-two grid: the title with the brochure
 * level beside it, and the location with the RERA number level beside that.
 * Pairing each fact with its neighbour keeps the right-hand column reading as
 * "about this heading" rather than as a stray call to action.
 *
 * The RERA field always renders. It is the first thing a careful buyer
 * checks, so its absence is stated ("Not available") rather than silently
 * omitted, which would read as though the page had simply forgotten it.
 *
 * The overview's title block: the project name, location, brochure and RERA.
 * Sub-pages use ProjectSectionTitle instead, which names the section alone.
 */
export function ProjectTitleRow({
  project,
  heading,
}: {
  project: ProjectDetail;
  heading: string;
}) {
  const street = (project.address || "").trim();
  const region = [project.sublocation, project.city, project.state, project.pincode]
    .filter(Boolean)
    .join(", ");
  const rera = (project.reraNumber || "").trim();

  return (
    <header className="flex! flex-col! gap-1!">
      {/* Phones stack title, location, RERA, then the brochure (order-last);
          from sm the four sit in a fixed 2×2, each placed explicitly. */}
      <div className="grid! grid-cols-1! gap-x-6! gap-y-2! sm:grid-cols-[minmax(0,1fr)_auto]! sm:items-center!">
        <h1 className="sm:col-start-1! sm:row-start-1! text-3xl! md:text-4xl! font-semibold! text-gray-900! tracking-tight! leading-tight! text-balance!">
          {heading}
        </h1>

        {project.brochureUrl && (
          <a
            href={project.brochureUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            title={project.brochureName ?? undefined}
            className="order-last! mt-2! justify-self-start! sm:order-none! sm:mt-0! sm:col-start-2! sm:row-start-1! sm:justify-self-end! inline-flex! items-center! gap-2! rounded-md! bg-white! px-4! py-2! text-sm! font-semibold! text-[#27427f]! ring-1! ring-[#27427f]/25! shadow-sm! no-underline! whitespace-nowrap! transition-[background-color,transform]! duration-150! ease-out-quint! hover:bg-[#27427f]/5! active:scale-[0.98]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]! focus-visible:ring-offset-2!"
          >
            <Download className="w-4! h-4!" aria-hidden="true" />
            Download brochure
          </a>
        )}

        {(street || region) && (
          <p className="sm:col-start-1! sm:row-start-2! flex! items-start! gap-2! text-base! text-gray-600!">
            <MapPin className="w-5! h-5! shrink-0! mt-0.5! text-gray-500!" aria-hidden="true" />
            <span className="min-w-0!">
              {street && <span className="block!">{street}</span>}
              {region && (
                <span className={street ? "block! text-gray-500!" : "block!"}>{region}</span>
              )}
            </span>
          </p>
        )}

        {/* Top-aligned to the location's first line, not centred against a
            two-line address. */}
        <p className="sm:col-start-2! sm:row-start-2! sm:self-start! sm:justify-self-end! sm:mt-0.5! flex! items-center! gap-1.5! text-sm! text-gray-600!">
          <BadgeCheck
            className={`w-4! h-4! shrink-0! ${rera ? "text-blue-600!" : "text-gray-400!"}`}
            aria-hidden="true"
          />
          <span className="text-gray-500!">RERA No:</span>
          {rera ? (
            <span className="font-semibold! text-gray-900! tabular-nums! break-all!">{rera}</span>
          ) : (
            <span className="text-gray-500!">Not available</span>
          )}
        </p>
      </div>
    </header>
  );
}

/**
 * A sub-page's title: just the section it holds, such as "Amenities". The
 * project is named by the breadcrumb, and the tabs show where the reader is.
 */
export function ProjectSectionTitle({ title }: { title: string }) {
  return (
    <header>
      <h1 className="text-3xl! md:text-4xl! font-semibold! text-gray-900! tracking-tight! leading-tight! text-balance!">
        {title}
      </h1>
    </header>
  );
}
