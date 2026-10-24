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
      <div className="lg:col-span-2! flex! flex-col! gap-6! min-w-0!">
        {children}
      </div>
      <ProjectAside project={project} />
    </div>
  );
}

/**
 * The project's identity uses two rows: the title has the full first row;
 * locality sits left of RERA and the brochure on the second row.
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
  const region = [
    project.sublocation,
    project.city,
    project.state,
    project.pincode,
  ]
    .filter(Boolean)
    .join(", ");
  const rera = (project.reraNumber || "").trim();

  return (
    <header className="flex! flex-col! gap-3!">
      <h1 className="m-0! text-2xl! md:text-3xl! font-semibold! text-[#0a0f1c]! tracking-[-0.025em]! leading-snug! text-balance!">
        {heading}
      </h1>
      <div className="flex! flex-col! gap-3! lg:flex-row! lg:items-center! lg:justify-between! lg:gap-6!">
        {(street || region) && (
          <p className="m-0! flex! min-w-0! items-start! gap-2! text-sm! leading-relaxed! text-[#1c2433]! lg:max-w-[45%]!">
            <MapPin
              className="w-[18px]! h-[18px]! shrink-0! mt-0.5! text-[#0a0f1c]!"
              aria-hidden="true"
            />
            <span className="min-w-0!">
              {[street, region].filter(Boolean).join(", ")}
            </span>
          </p>
        )}
        {/* RERA always renders: its absence is stated, not silently omitted. */}
        <div className="flex! min-w-0! flex-wrap! items-center! gap-2! lg:justify-end!">
          <p
            className={`m-0! inline-flex! min-w-0! items-center! gap-1.5! rounded-full! px-3! py-2! text-xs! ${
              rera
                ? "bg-white! text-[#1c2433]! ring-1! ring-[#e2e9f4]!"
                : "bg-white! text-[#5f6b80]! ring-1! ring-[#e2e9f4]!"
            }`}
          >
            <BadgeCheck
              className={`w-4! h-4! shrink-0! ${rera ? "text-emerald-600!" : "text-gray-400!"}`}
              aria-hidden="true"
            />
            <span className="text-[#5f6b80]!">RERA</span>
            {rera ? (
              <span className="font-semibold! tabular-nums! break-all!">
                {rera}
              </span>
            ) : (
              <span>Not available</span>
            )}
          </p>
          {project.brochureUrl && (
            <a
              href={project.brochureUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              title={
                (project as ProjectDetail & { brochureSeoTitle?: string })
                  .brochureSeoTitle ||
                project.brochureName ||
                undefined
              }
              className="inline-flex! shrink-0! items-center! gap-2! rounded-full! bg-white! px-3! py-2! text-xs! font-semibold! text-[#0a0f1c]! ring-1! ring-[#cfdcf0]! no-underline! whitespace-nowrap! transition-[box-shadow,color,transform]! duration-150! ease-out-quint! hover:ring-[#0a0f1c]! active:scale-[0.98]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#0a0f1c]! focus-visible:ring-offset-2!"
            >
              <Download className="w-4! h-4!" aria-hidden="true" />
              {"Download brochure"}
            </a>
          )}
        </div>
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
      <h1 className="m-0! text-2xl! md:text-3xl! font-semibold! text-[#0a0f1c]! tracking-[-0.035em]! leading-tight! text-balance!">
        {title}
      </h1>
    </header>
  );
}
