import Image from "next/image";
import { Coins, Download, Info, MapPin, ShieldCheck } from "lucide-react";
import type { ProjectDetail } from "@/lib/api/projects";
import { priceRangeLabel, rateFact } from "@/lib/project-overview";
import { emi } from "@/lib/emi";
import { ProjectEnquiryActions } from "@/components/site/project/ProjectEnquiryActions";
import { WishlistButton } from "@/components/site/wishlist/WishlistButton";
import { LABEL } from "@/components/site/project/project-ui";
import { formatAddressLines } from "@/lib/location-display";

const ASIDE_CARD =
  "bg-white! rounded-[20px]! border! border-gray-200/70! shadow-sm! p-6!";

/**
 * The enquiry card: what it costs, who builds it, and the two actions.
 * The brochure lives in the title row instead, beside the thing it describes.
 */
function EnquiryCard({ project }: { project: ProjectDetail }) {
  const rate = rateFact(project);
  // Same basis as the listing card: lowest starting rate, 20 years, range floor.
  const emiStarts =
    project.ranges.minPrice != null && project.ranges.minPrice > 0
      ? emi(project.ranges.minPrice, 7.25, 20)
      : null;
  const locationLines = formatAddressLines(project.address, {
    sublocation: project.sublocation,
    city: project.city,
    pincode: project.pincode,
  });

  return (
    <div className={ASIDE_CARD}>
      <div className="flex! items-start! justify-between! gap-3!">
        <h2 className="min-w-0! text-2xl! font-semibold! text-gray-900! tracking-tight! text-balance!">
          {project.name}
        </h2>
        <WishlistButton
          propertyId={project.id}
          propertyType="project"
          className="mt-0.5!"
        />
      </div>
      {locationLines.length > 0 && (
        <p className="mt-1.5! flex! items-start! gap-1.5! text-sm! text-gray-500!">
          <MapPin className="w-4! h-4! shrink-0!" aria-hidden="true" />
          <span className="min-w-0!">
            {locationLines.map((line, index) => (
              <span className="block!" key={`${line}-${index}`}>{line}</span>
            ))}
          </span>
        </p>
      )}
      <div className="mt-4! flex! items-end! justify-between! gap-4! leading-none!">
        <div className="flex! flex-col! gap-1! min-w-0!">
          <p className="text-2xl! font-semibold! text-gray-900! tracking-tight! tabular-nums!">
            {priceRangeLabel(project)}
          </p>
          {rate && (
            <p className="text-sm! text-gray-500! tabular-nums!">
              {rate.value} {rate.label.replace("Rate ", "")}
              {rate.note ? ` ${rate.note}` : ""}
            </p>
          )}
        </div>
        {emiStarts ? (
          <div className="flex! flex-col! gap-1! shrink-0! text-right!">
            <span className="text-[11px]! font-medium! uppercase! tracking-wide! text-gray-500!">EMI from</span>
            <span className="text-[15px]! font-semibold! text-gray-800! tabular-nums!">
              ₹{Math.round(emiStarts).toLocaleString("en-IN")}/mo
            </span>
          </div>
        ) : null}
      </div>

      <div className="mt-6!">
        <ProjectEnquiryActions project={project} />
        {project.brochureUrl && (
          <a
            href={project.brochureUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            title={project.brochureName ?? undefined}
            className="mt-2! w-full! inline-flex! items-center! justify-center! gap-2! rounded-xl! bg-white! px-4! py-3! text-base! font-semibold! text-[#27427f]! ring-1! ring-[#27427f]/25! cursor-pointer! transition-[background-color,transform]! duration-150! ease-out-quint! hover:bg-[#27427f]/5! active:scale-[0.98]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#27427f]! focus-visible:ring-offset-2!"
          >
            <Download className="w-4! h-4!" aria-hidden="true" />
            Download brochure
          </a>
        )}
      </div>

      {project.reraNumber && (
        <p className="mt-6! pt-6! border-t! border-gray-200! flex! items-center! gap-2! text-sm! text-gray-600!">
          <ShieldCheck className="w-4! h-4! shrink-0! text-emerald-600!" />
          RERA registered
          <span className="sr-only">, registration number {project.reraNumber}</span>
        </p>
      )}

      <div className="mt-6! pt-5! border-t! border-gray-200! flex! flex-col! items-center! gap-1.5! text-center!">
        <p className="flex! items-center! gap-1.5! text-sm! text-gray-500!">
          <Coins className="w-4! h-4! shrink-0! text-emerald-600!" aria-hidden="true" />
          Zero brokerage on this project
        </p>
        {project.projectCode && (
          <p className="flex! items-center! gap-1.5! text-sm! text-gray-500! tabular-nums!">
            <Info className="w-4! h-4! shrink-0!" aria-hidden="true" />
            ID: {project.projectCode}
          </p>
        )}
      </div>
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
