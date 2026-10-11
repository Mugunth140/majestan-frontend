import { CENT_TO_SQFT, formatINRRange } from "@/lib/api/projects";
import type { ProjectDetail, ProjectUnit } from "@/lib/api/projects";
import {
  groupUnitsByConfiguration,
  projectTypeLabel,
  unitAreaSqft,
} from "@/lib/project-overview";

/**
 * One card per configuration on the overview, and the numbers on it.
 *
 * Summaries are per group, not per unit: a buyer comparing 3 BHK with 2 BHK
 * wants a range across the flats, not a list of every flat. Area and price
 * come from the same set of units (the ones still on sale when any are), so
 * the two numbers on one card never describe different flats.
 */

export const PRICE_ON_REQUEST = "Price on request";

export type ConfigurationSummary = {
  /** Matches the configuration group key, so the sub-page can open on it. */
  key: string;
  /** "3 BHK", "4 cents". */
  label: string;
  /** "Apartment", "Villa" or "Plot". */
  typeLabel: string;
  /** "Super built-up area", "Built-up area", "Carpet area" or "Plot area". */
  areaLabel: string | null;
  /** "1,748 – 2,010 sq.ft", or "4 cents" for plots. */
  areaValue: string | null;
  /** The metric equivalent in brackets: "(162.39 – 186.74 sqm)". */
  areaSecondary: string | null;
  /** "₹1.3 – 1.46 Cr", or PRICE_ON_REQUEST when no unit is priced. */
  priceLabel: string;
  /** Units still on sale in this configuration. Zero means sold out. */
  availableCount: number;
};

const SQM_PER_SQFT = 0.09290304;

/**
 * Widest measure first, matching the order a buyer quotes them in. A flat
 * with only a carpet figure still gets an area; the label says which one it is.
 */
const AREA_MEASURES = [
  { label: "Super built-up area", field: "superBuiltupAreaSqft" },
  { label: "Built-up area", field: "builtupAreaSqft" },
  { label: "Carpet area", field: "carpetAreaSqft" },
] as const;

/** Backend decimals arrive as strings. Anything not positive counts as missing. */
function positive(value: string | number | null | undefined): number {
  const n = typeof value === "number" ? value : parseFloat(String(value ?? ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

const formatSqft = (n: number) => Math.round(n).toLocaleString("en-IN");
const formatSqm = (n: number) =>
  (n * SQM_PER_SQFT).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const formatCents = (n: number) => `${parseFloat(n.toFixed(2))}`;

/**
 * "1,748 – 2,010", or one value when both ends format the same. Comparing the
 * formatted strings, not the raw numbers, stops "1,748 – 1,748" appearing for
 * two areas that differ only past the rounding the reader sees.
 */
function rangeText(values: number[], format: (n: number) => string): string {
  const low = format(Math.min(...values));
  const high = format(Math.max(...values));
  return low === high ? low : `${low} – ${high}`;
}

const NO_AREA = { areaLabel: null, areaValue: null, areaSecondary: null } as const;

/**
 * Plots are sold by land, so the measure is cents with square feet in
 * brackets. Flats and villas use the first area measure any unit in the
 * group has, in sq.ft with square metres in brackets.
 */
function areaOf(
  units: ProjectUnit[],
  projectType: string,
): Pick<ConfigurationSummary, "areaLabel" | "areaValue" | "areaSecondary"> {
  if (projectType === "plot") {
    const cents = units.map((u) => positive(u.plotAreaCents)).filter((n) => n > 0);
    if (cents.length === 0) return NO_AREA;
    return {
      areaLabel: "Plot area",
      areaValue: `${rangeText(cents, formatCents)} cents`,
      areaSecondary: `(${rangeText(
        cents.map((c) => c * CENT_TO_SQFT),
        formatSqft,
      )} sq.ft)`,
    };
  }

  for (const measure of AREA_MEASURES) {
    const sqft = units.map((u) => positive(u[measure.field])).filter((n) => n > 0);
    if (sqft.length === 0) continue;
    return {
      areaLabel: measure.label,
      areaValue: `${rangeText(sqft, formatSqft)} sq.ft`,
      areaSecondary: `(${rangeText(sqft, formatSqm)} sqm)`,
    };
  }
  return NO_AREA;
}

export function summarizeConfigurations(project: ProjectDetail): ConfigurationSummary[] {
  return groupUnitsByConfiguration(project).map((group) => {
    const open = group.units.filter((u) => u.status === "available");
    // Same rule as sellableUnits: quote the stock on sale, and fall back to
    // the whole group only when nothing is open.
    const sellable = open.length > 0 ? open : group.units;
    const prices = sellable.map((u) => positive(u.price)).filter((n) => n > 0);

    return {
      key: group.key,
      label: group.label,
      typeLabel: projectTypeLabel(project.projectType),
      ...areaOf(sellable, project.projectType),
      priceLabel:
        prices.length > 0
          ? formatINRRange(Math.min(...prices), Math.max(...prices))
          : PRICE_ON_REQUEST,
      availableCount: open.length,
    };
  });
}

/**
 * The one area figure for a single unit, used on the floor plan previews.
 * Same measure order as unitAreaSqft, so a preview and its card agree.
 */
export function unitAreaLabel(unit: ProjectUnit, projectType: string): string | null {
  if (projectType === "plot") {
    const cents = positive(unit.plotAreaCents);
    return cents > 0 ? `${formatCents(cents)} cents` : null;
  }
  const sqft = unitAreaSqft(unit, projectType);
  return sqft > 0 ? `${formatSqft(sqft)} sq.ft` : null;
}
