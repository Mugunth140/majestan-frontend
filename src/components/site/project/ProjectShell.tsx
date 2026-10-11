import Link from "next/link";
import { ChevronLeft, Download, MapPin } from "lucide-react";
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
 * Title, address and the brochure, on one row. The brochure sits here rather
 * than in the aside because it is a document *about* this heading — it reads
 * as part of the project's identity, not as one more call to action.
 *
 * Sub-pages pass their own `heading` (each page needs its own h1) plus an
 * `eyebrow` linking back to the overview, so the reader never loses which
 * project they are in or how to get back to it.
 */
export function ProjectTitleRow({
  project,
  heading,
  eyebrow,
  eyebrowHref,
}: {
  project: ProjectDetail;
  heading: string;
  eyebrow?: string;
  eyebrowHref?: string;
}) {
  const street = (project.address || "").trim();
  const region = [project.sublocation, project.city, project.state, project.pincode]
    .filter(Boolean)
    .join(", ");

  return (
    <header className="flex! flex-col! gap-4! sm:flex-row! sm:items-start! sm:justify-between!">
      <div className="min-w-0!">
        {eyebrow &&
          (eyebrowHref ? (
            <Link
              href={eyebrowHref}
              className="mb-1! inline-flex! items-center! gap-1! text-sm! font-medium! text-[#27427f]! no-underline! rounded-md! transition-colors! duration-150! ease-out-quint! hover:text-[#1e3563]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]!"
            >
              <ChevronLeft className="w-4! h-4!" aria-hidden="true" />
              {eyebrow}
            </Link>
          ) : (
            <p className="mb-1! text-sm! font-medium! text-[#27427f]!">{eyebrow}</p>
          ))}
        <h1 className="text-3xl! md:text-4xl! font-semibold! text-gray-900! tracking-tight! leading-tight! text-balance!">
          {heading}
        </h1>
        {(street || region) && (
          <p className="mt-2! flex! items-start! gap-2! text-base! text-gray-600!">
            <MapPin className="w-5! h-5! shrink-0! mt-0.5! text-gray-500!" aria-hidden="true" />
            <span className="min-w-0!">
              {street && <span className="block!">{street}</span>}
              {region && (
                <span className={street ? "block! text-gray-500!" : "block!"}>{region}</span>
              )}
            </span>
          </p>
        )}
      </div>

      {project.brochureUrl && (
        <a
          href={project.brochureUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          title={project.brochureName ?? undefined}
          className="shrink-0! self-start! inline-flex! items-center! gap-2! rounded-2xl! bg-white! px-4! py-2! text-sm! font-semibold! text-[#27427f]! ring-1! ring-[#27427f]/25! shadow-sm! no-underline! transition-[background-color,transform]! duration-150! ease-out-quint! hover:bg-[#27427f]/5! active:scale-[0.98]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]! focus-visible:ring-offset-2!"
        >
          <Download className="w-4! h-4!" aria-hidden="true" />
          Download brochure
        </a>
      )}
    </header>
  );
}
