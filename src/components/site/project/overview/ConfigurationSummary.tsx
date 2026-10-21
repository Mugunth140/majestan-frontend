import Link from "next/link";
import { ArrowUpRight, LayoutGrid } from "lucide-react";
import type { ProjectDetail } from "@/lib/api/projects";
import {
  PRICE_ON_REQUEST,
  summarizeConfigurations,
} from "@/lib/project-config-summary";
import { priceRangeLabel } from "@/lib/project-overview";
import {
  FOCUS_RING,
  INK,
  MUTED,
  Panel,
  PanelEmpty,
  PanelLink,
} from "@/components/site/project/overview/overview-ui";
import { RequestButton } from "@/components/site/project/RequestButton";
import {
  CompactSummaryBody,
  SummaryBody,
} from "@/components/site/project/configuration-parts";

/**
 * Shared by the configuration cards and the floor plan previews, so both
 * kinds of tile lift and ring the same way on hover and focus.
 */
const TILE_INTERACTION =
  "block! border! overflow-hidden! bg-white! no-underline! transition-[border-color,box-shadow,transform]! duration-150! ease-out-quint! hover:border-[#1645bf]/40! hover:shadow-sm! active:scale-[0.99]! focus-visible:outline-none! focus-visible:ring-2! focus-visible:ring-[#1645bf]! focus-visible:ring-offset-2!";

export const CONFIGURATION_TILE = `${TILE_INTERACTION} rounded-2xl! border-gray-200!`;
/* The floor plans page's jump cards: tighter corners, a blue-tinted edge to
   match their tinted header. */
const COMPACT_TILE = `${TILE_INTERACTION} rounded-xl! border-[#d3ddf3]!`;

/**
 * One card per configuration: type, area, price and availability. Each card
 * opens that configuration's detail on the floor plans page; `hrefFor` lets
 * that page reuse the cards as in-page jump links, in their compact form.
 */
export function ConfigurationTiles({
  project,
  hrefFor,
  compact = false,
}: {
  project: ProjectDetail;
  hrefFor: (key: string) => string;
  compact?: boolean;
}) {
  return (
    <ul
      className={`grid! list-none! p-0! m-0! ${
        compact
          ? "grid-cols-2! sm:grid-cols-3! gap-3!"
          : "grid-cols-1! sm:grid-cols-2! gap-4! mt-6!"
      }`}
    >
      {summarizeConfigurations(project).map((summary) => (
        <li key={summary.key} className="min-w-0!">
          <Link
            href={hrefFor(summary.key)}
            className={`${compact ? COMPACT_TILE : CONFIGURATION_TILE} h-full!`}
          >
            {compact ? (
              <CompactSummaryBody summary={summary} />
            ) : (
              <SummaryBody summary={summary} />
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * The overview's configuration section: one ruled row per configuration,
 * read across like a price list — type, size, price, what's left. Each row
 * opens the floor plans page.
 */
export function ConfigurationSummary({ project }: { project: ProjectDetail }) {
  if (project.units.length === 0) {
    return (
      <Panel title="Configurations" id="configurations">
        <PanelEmpty
          icon={LayoutGrid}
          title="Configurations are being finalised"
          body="Unit types, sizes and prices appear here once the developer releases them."
          action={
            <RequestButton
              label="Ask for prices"
              message={`Please share the available configurations and prices at ${project.name}.`}
            />
          }
        />
      </Panel>
    );
  }

  const slug = project.canonicalSlug;
  const summaries = summarizeConfigurations(project);
  return (
    <Panel
      title="Configurations"
      id="configurations"
      tint
      meta={`${summaries.length} ${summaries.length === 1 ? "type" : "types"} · ${priceRangeLabel(project)}`}
      action={<PanelLink href={`/${slug}/floor-plans`}>Floor plans</PanelLink>}
    >
      {/* One card per configuration: the type in a blue-washed band, the
          price as the headline, the size beneath a hairline. Each opens the
          floor plans page. */}
      <ul className="m-0! mt-6! p-0! list-none! grid! grid-cols-1! sm:grid-cols-2! gap-4!">
        {summaries.map((summary) => {
          const priced = summary.priceLabel !== PRICE_ON_REQUEST;
          const showArea =
            summary.areaLabel && summary.areaValue !== summary.label;
          return (
            <li key={summary.key} className="min-w-0!">
              <Link
                href={`/${slug}/floor-plans`}
                className={`group/card flex! h-full! flex-col! overflow-hidden! rounded-xl! border! border-[#e6ebf2]! bg-white! no-underline! transition-[border-color,box-shadow,transform]! duration-200! ease-out-quint! hover:-translate-y-0.5! hover:border-[#bcd0f7]! hover:shadow-[0_14px_30px_-18px_rgba(22,69,191,0.35)]! active:scale-[0.99]! ${FOCUS_RING}`}
              >
                <span className="flex! items-center! justify-between! gap-3! border-b! border-[#e3ebf8]! bg-[linear-gradient(120deg,#f4f8ff,#e6efff)]! px-4! py-3!">
                  <span className="min-w-0! truncate!">
                    <span className="text-base! font-semibold! text-[var(--ov-blue-deep)]!">
                      {summary.label}
                    </span>{" "}
                    <span className={`text-sm! ${MUTED}`}>
                      {summary.typeLabel}
                    </span>
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="w-4! h-4! shrink-0! text-[var(--ov-muted)]! transition-[transform,color]! duration-150! ease-out-quint! group-hover/card:text-[var(--ov-blue)]! group-hover/card:translate-x-0.5! group-hover/card:-translate-y-0.5!"
                  />
                </span>
                <span className="flex! flex-1! flex-col! p-4!">
                  <span
                    className={`block! font-semibold! tracking-[-0.025em]! leading-snug! tabular-nums! ${INK} ${priced ? "text-xl! whitespace-nowrap!" : "text-base!"}`}
                  >
                    {summary.priceLabel}
                  </span>
                  {summary.rateLabel && (
                    <span
                      className={`mt-2! block! text-[13px]! tabular-nums! ${MUTED}`}
                    >
                      {summary.rateLabel}
                    </span>
                  )}
                  {/* Pushes the size line to the card's foot, at least 20px down. */}
                  <span
                    aria-hidden="true"
                    className="block! min-h-5! flex-1!"
                  />
                  {showArea && (
                    <span className="block! border-t! border-[#eef1f6]! pt-3.5!">
                      <span className={`block! text-[13px]! ${MUTED}`}>
                        {summary.areaLabel}
                      </span>
                      <span
                        className={`mt-0.5! block! text-[15px]! font-semibold! tabular-nums! ${INK}`}
                      >
                        {summary.areaValue}
                      </span>
                    </span>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
