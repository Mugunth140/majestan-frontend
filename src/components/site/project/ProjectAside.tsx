import Image from "next/image";
import { Coins, Download, Info, MapPin, ShieldCheck } from "lucide-react";
import type { ProjectDetail } from "@/lib/api/projects";
import { priceRangeLabel, rateFact } from "@/lib/project-overview";
import { emi } from "@/lib/emi";
import { ProjectEnquiryActions } from "@/components/site/project/ProjectEnquiryActions";
import { WishlistButton } from "@/components/site/wishlist/WishlistButton";
import { LABEL } from "@/components/site/project/project-ui";
import { formatAddressLines } from "@/lib/location-display";
import { LISTING_SUMMARY_CARD } from "@/components/site/shared/listing-summary-styles";

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
    <div className={LISTING_SUMMARY_CARD}>
      <div className="flex! items-start! justify-between! gap-3!">
        <h2 className="m-0! min-w-0! text-xl! font-semibold! text-[#0a0f1c]! tracking-[-0.025em]! text-balance!">
          {project.name}
        </h2>
        <WishlistButton
          propertyId={project.id}
          propertyType="project"
          className="mt-0.5!"
        />
      </div>
      {locationLines.length > 0 && (
        <p className="mt-1.5! flex! items-start! gap-1.5! text-sm! text-[#1c2433]!">
          <MapPin
            className="w-4! h-4! shrink-0! mt-0.5! text-[#0a0f1c]!"
            aria-hidden="true"
          />
          <span className="min-w-0!">
            {locationLines.map((line, index) => (
              <span className="block!" key={`${line}-${index}`}>
                {line}
              </span>
            ))}
          </span>
        </p>
      )}
      {/* The price takes its own line: a range like "₹3.6 Cr – 4.86 Cr" or
          "₹85.5 L – 99.75 L" is too wide to share a row with the EMI. The
          rate and the EMI then sit beneath it on one baseline. */}
      <div className="mt-5! pt-5! border-t! border-[#e2e9f4]!">
        <p className="m-0! whitespace-nowrap! text-[clamp(22px,1.9vw,28px)]! font-semibold! leading-none! text-[#0a0f1c]! tracking-[-0.03em]! tabular-nums!">
          {priceRangeLabel(project)}
        </p>
        {/* Two aligned rows, label left and figure right, so they line up
            however long the price range or the rate is. */}
        {(rate || emiStarts) && (
          <dl className="m-0! mt-3.5! flex! flex-col! gap-1.5! text-[13px]!">
            {rate && (
              <div className="flex! items-baseline! justify-between! gap-4!">
                <dt className="text-[13px]! font-normal! text-[#5f6b80]!">
                  {rate.label
                    .replace("Rate ", "")
                    .replace(/^./, (c) => c.toUpperCase())}
                </dt>
                <dd className="m-0! text-[13px]! font-semibold! text-[#1c2433]! tabular-nums! text-right!">
                  {rate.value}
                  {rate.note ? (
                    <span className="text-[13px]! font-normal! text-[#5f6b80]!">
                      {" "}
                      {rate.note}
                    </span>
                  ) : null}
                </dd>
              </div>
            )}
            {emiStarts ? (
              <div className="flex! items-baseline! justify-between! gap-4!">
                <dt className="text-[13px]! font-normal! text-[#5f6b80]!">
                  EMI from
                </dt>
                <dd className="m-0! text-[13px]!">
                  <a
                    href="#calculators"
                    className="text-[13px]! font-semibold! text-[#1c2433]! no-underline! tabular-nums! whitespace-nowrap! hover:underline! underline-offset-4!"
                  >
                    ₹{Math.round(emiStarts).toLocaleString("en-IN")}/mo
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        )}
      </div>

      <div className="mt-6!">
        <ProjectEnquiryActions project={project} />
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
            className="mt-2.5! w-full! inline-flex! items-center! justify-center! gap-2! rounded-xl! bg-transparent! px-4! py-3! text-base! font-semibold! text-[#0a0f1c]! no-underline! cursor-pointer! transition-[color,background-color,transform]! duration-150! ease-out-quint! hover:bg-[#eef4ff]! hover:text-[#1645bf]! active:scale-[0.98]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#2563eb]!"
          >
            <Download className="w-4! h-4!" aria-hidden="true" />
            {"Download brochure"}
          </a>
        )}
      </div>

      <div className="mt-4! pt-4! border-t! border-[#e2e9f4]! flex! flex-col! items-center! gap-1.5! text-center!">
        <p className="m-0! flex! items-center! gap-1.5! text-[13px]! text-[#465066]!">
          <Coins
            className="w-4! h-4! shrink-0! text-emerald-600!"
            aria-hidden="true"
          />
          Zero brokerage on this project
        </p>
        {project.projectCode && (
          <p className="m-0! flex! items-center! gap-1.5! text-[13px]! text-[#5f6b80]! tabular-nums!">
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
    <div className="rounded-2xl! border! border-[#e6ebf2]! bg-white! p-5! flex! items-center! gap-4!">
      <Image
        src="/assets/images/logo/fav.png"
        alt="Majestan Realty"
        width={48}
        height={48}
        className="w-12! h-12! object-contain! shrink-0!"
      />
      <div className="min-w-0!">
        <p className={LABEL}>Listed by</p>
        <p className="m-0! mt-0.5! text-base! font-semibold! text-[#0a0f1c]!">
          Majestan Realty
        </p>
        <p className="m-0! mt-1! flex! items-center! gap-1.5! text-sm! text-[#5f6b80]!">
          <ShieldCheck
            className="w-4! h-4! shrink-0! text-emerald-600!"
            aria-hidden="true"
          />
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
      <div className="lg:sticky! lg:top-[calc(var(--site-header-h)+69px)]! flex! flex-col! gap-4!">
        <EnquiryCard project={project} />
        <ListedByCard />
      </div>
    </aside>
  );
}
