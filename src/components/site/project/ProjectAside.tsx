import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import type { ProjectDetail } from "@/lib/api/projects";
import { priceRangeLabel, rateFact } from "@/lib/project-overview";
import { ProjectEnquiryActions } from "@/components/site/project/ProjectEnquiryActions";
import { LABEL } from "@/components/site/project/project-ui";

const ASIDE_CARD =
  "bg-white! rounded-[20px]! border! border-gray-200/70! shadow-sm! p-6!";

/**
 * The enquiry card: what it costs, who builds it, and the two actions.
 * The brochure lives in the title row instead, beside the thing it describes.
 */
function EnquiryCard({ project }: { project: ProjectDetail }) {
  const isPlot = project.projectType === "plot";
  const rate = rateFact(project);
  const builderName = project.builder?.name || project.builderName;

  return (
    <div className={ASIDE_CARD}>
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
          By <span className="font-medium! text-gray-900!">{builderName}</span>
        </p>
      )}

      <div className="mt-6!">
        <ProjectEnquiryActions project={project} />
      </div>

      {project.reraNumber && (
        <p className="mt-6! pt-6! border-t! border-gray-200! flex! items-center! gap-2! text-sm! text-gray-600!">
          <ShieldCheck className="w-4! h-4! shrink-0! text-emerald-600!" />
          RERA registered
          <span className="sr-only">, registration number {project.reraNumber}</span>
        </p>
      )}
    </div>
  );
}

/** Who is selling it. Majestan is the listing agent on every project page. */
function ListedByCard() {
  return (
    <div className={`${ASIDE_CARD} flex! items-center! gap-4!`}>
      <Image
        src="/assets/images/logo/fav.png"
        alt="Majestan Realty"
        width={48}
        height={48}
        className="w-12! h-12! object-contain! shrink-0!"
      />
      <div className="min-w-0!">
        <p className={LABEL}>Listed by</p>
        <p className="mt-0.5! text-base! font-semibold! text-gray-900!">
          Majestan Realty
        </p>
        <p className="mt-1! flex! items-center! gap-1.5! text-sm! text-gray-500!">
          <ShieldCheck className="w-4! h-4! shrink-0! text-emerald-600!" aria-hidden="true" />
          Verified
        </p>
      </div>
    </div>
  );
}

/**
 * The right-hand column on every project page. It starts level with the first
 * section beside it, then stays pinned just below the navbar and section tabs
 * (64px + 45px, plus a 24px gap) so the enquiry is in reach while the reader
 * scrolls.
 */
export function ProjectAside({ project }: { project: ProjectDetail }) {
  return (
    <aside aria-label="Enquire about this project" className="min-w-0!">
      <div className="lg:sticky! lg:top-[133px]! flex! flex-col! gap-4!">
        <EnquiryCard project={project} />
        <ListedByCard />
      </div>
    </aside>
  );
}
