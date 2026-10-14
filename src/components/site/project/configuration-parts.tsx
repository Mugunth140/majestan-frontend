import { PRICE_ON_REQUEST, type ConfigurationSummary } from "@/lib/project-config-summary";
import { titleCase } from "@/lib/project-overview";

/**
 * Pieces shared by the overview's configuration cards and the floor plans
 * page, so a configuration reads the same in both places.
 */

/** A buyer can act on green. Amber is in motion. Gray is gone. */
const STATUS_CLASS: Record<string, string> = {
  available: "bg-emerald-50! text-emerald-800! ring-emerald-200!",
  reserved: "bg-amber-50! text-amber-900! ring-amber-200!",
  booked: "bg-amber-50! text-amber-900! ring-amber-200!",
  sold: "bg-gray-100! text-gray-600! ring-gray-200!",
  rented: "bg-gray-100! text-gray-600! ring-gray-200!",
  inactive: "bg-gray-100! text-gray-600! ring-gray-200!",
};

export function StatusChip({ status }: { status: string }) {
  const tone = STATUS_CLASS[status] ?? STATUS_CLASS.inactive;
  return (
    <span
      className={`inline-flex! items-center! px-2! py-0.5! rounded-md! text-xs! font-medium! ring-1! whitespace-nowrap! ${tone}`}
    >
      {titleCase(status)}
    </span>
  );
}

export function availabilityText(count: number): string {
  return count > 0 ? `${count} unit${count === 1 ? "" : "s"} available` : "Sold out";
}

/**
 * The card face for one configuration: type in a tinted band, then area,
 * price and availability. Spans rather than block elements so it can sit
 * inside a link.
 */
export function SummaryBody({ summary }: { summary: ConfigurationSummary }) {
  const priced = summary.priceLabel !== PRICE_ON_REQUEST;
  return (
    <>
      <span className="block! px-5! py-3! text-base! bg-[#1645bf]/5! text-gray-700!">
        <span className="font-semibold! text-[#1645bf]!">{summary.label}</span>{" "}
        {summary.typeLabel}
      </span>
      <span className="block! px-5! py-4!">
        {summary.areaLabel && (
          <>
            <span className="block! text-xs! font-medium! uppercase! tracking-wide! text-gray-500!">
              {summary.areaLabel}
            </span>
            <span className="block! mt-1! text-sm! font-semibold! text-gray-900! tabular-nums!">
              {summary.areaValue}
              {summary.areaSecondary && (
                <span className="font-normal! text-gray-500!"> {summary.areaSecondary}</span>
              )}
            </span>
          </>
        )}
        <span
          className={`block! mt-3! font-semibold! text-gray-900! tabular-nums! ${
            priced ? "text-xl!" : "text-base!"
          }`}
        >
          {summary.priceLabel}
        </span>
        <span className="block! mt-1! text-xs! text-gray-500!">
          {availabilityText(summary.availableCount)}
        </span>
      </span>
    </>
  );
}

/**
 * The same card, tightened for the floor plans page, where it is a jump
 * list above the detail rather than the detail itself. Area measure in
 * sentence case beside its value, price and availability on one line.
 */
export function CompactSummaryBody({ summary }: { summary: ConfigurationSummary }) {
  return (
    <>
      <span className="block! px-4! py-2! text-sm! bg-[#e8eefb]! border-b! border-[#d3ddf3]! text-[#1645bf]/80!">
        <span className="font-semibold! text-[#1645bf]!">{summary.label}</span>{" "}
        {summary.typeLabel}
      </span>
      <span className="block! px-4! py-3!">
        <span className="flex! items-baseline! justify-between! gap-3!">
          <span className="text-base! font-semibold! text-gray-900! tabular-nums! truncate!">
            {summary.priceLabel}
          </span>
          <span
            className={`shrink-0! text-xs! ${
              summary.availableCount > 0 ? "text-emerald-700!" : "text-gray-500!"
            }`}
          >
            {summary.availableCount > 0 ? `${summary.availableCount} available` : "Sold out"}
          </span>
        </span>
        {summary.areaLabel && (
          <span className="block! mt-1! text-xs! text-gray-500! tabular-nums!">
            {summary.areaLabel.replace(/ area$/, "")} · {summary.areaValue}
          </span>
        )}
      </span>
    </>
  );
}
