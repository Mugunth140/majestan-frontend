import { CENT_TO_SQFT, formatINR } from "@/lib/api/projects";
import type { ProjectDetail, ProjectUnit } from "@/lib/api/projects";

/**
 * Derivations for the project overview page.
 *
 * Kept out of the view for one reason that matters more than testability: the
 * old overview built three overlapping lists of the same fields inline
 * (a stats grid, a sidebar grid, and a sidebar footer), so BHK, area,
 * possession, RERA, developer and project id each rendered two or three
 * times. Deciding *once*, here, which slot owns a fact is what keeps that
 * from happening again.
 *
 *   buildFacts      → the fact rail. The five numbers a buyer decides on.
 *   buildDetailRows → the spec sheet. Everything else, exactly once.
 *
 * Nothing appears in both.
 */

/** Positive finite number, or 0. Backend decimals arrive as strings. */
function num(value: unknown): number {
  const n = typeof value === "number" ? value : parseFloat(String(value ?? ""));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

const inLakhs = (n: number) => n.toLocaleString("en-IN");

export function titleCase(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** "Dec 2026" — a month is the honest precision for a possession promise. */
export function formatPossession(value: string | null | undefined): string | null {
  if (!value || !value.trim()) return null;
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value;
  const month = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ][dt.getMonth()];
  return `${month} ${dt.getFullYear()}`;
}

export type PossessionTone = "ready" | "building" | "launch";

export function possessionTone(status: string): PossessionTone {
  if (status === "ready_to_move") return "ready";
  if (status === "new_launch") return "launch";
  return "building";
}

export function projectTypeLabel(projectType: string): string {
  if (projectType === "villa") return "Villa";
  if (projectType === "plot") return "Plot";
  return "Apartment";
}

/** Saleable area in sq.ft, widest measure first — plots are measured in cents. */
export function unitAreaSqft(unit: ProjectUnit, projectType: string): number {
  if (projectType === "plot") {
    const cents = num(unit.plotAreaCents);
    if (cents) return cents * CENT_TO_SQFT;
    return num(unit.plotAreaSqft);
  }
  return (
    num(unit.superBuiltupAreaSqft) ||
    num(unit.builtupAreaSqft) ||
    num(unit.carpetAreaSqft)
  );
}

/** Units a buyer can still act on. Falls back to all units when none are open. */
export function sellableUnits(project: ProjectDetail): ProjectUnit[] {
  const open = project.units.filter((u) => u.status === "available");
  return open.length > 0 ? open : project.units;
}

export function priceRangeLabel(project: ProjectDetail): string {
  const { minPrice, maxPrice } = project.ranges;
  if (minPrice != null && maxPrice != null && minPrice !== maxPrice) {
    return `${formatINR(minPrice)} – ${formatINR(maxPrice)}`;
  }
  if (minPrice != null) return formatINR(minPrice);
  if (maxPrice != null) return formatINR(maxPrice);
  return "Price on request";
}

/** Range of a numeric series as "low – high", or the single value. */
function rangeOf(values: number[], format: (n: number) => string): string | null {
  if (values.length === 0) return null;
  const low = Math.min(...values);
  const high = Math.max(...values);
  return low === high ? format(low) : `${format(low)} – ${format(high)}`;
}

export function areaRangeLabel(project: ProjectDetail): string | null {
  const areas = sellableUnits(project)
    .map((u) => unitAreaSqft(u, project.projectType))
    .filter((n) => n > 0);
  return rangeOf(areas, (n) => `${Math.round(n).toLocaleString("en-IN")} sq.ft`);
}

export function plotSizeLabel(project: ProjectDetail): string | null {
  const cents = sellableUnits(project)
    .map((u) => num(u.plotAreaCents))
    .filter((n) => n > 0);
  return rangeOf(cents, (n) => `${parseFloat(n.toFixed(2))} cents`);
}

export function configurationLabel(project: ProjectDetail): string | null {
  const bhk = project.ranges.bhk;
  if (bhk.length === 0) return null;
  const sorted = [...bhk].sort((a, b) => a - b);
  return `${sorted.join(", ")} BHK`;
}

/**
 * Lowest unit rate, priced per cent for plots and per sq.ft for everything
 * else. Derived per unit rather than from the min price over the min area —
 * those two can belong to different units, which quietly invents a rate no
 * unit is actually sold at.
 */
export function rateFact(project: ProjectDetail): Fact | null {
  const isPlot = project.projectType === "plot";
  const rates = sellableUnits(project)
    .map((u) => {
      const price = num(u.price);
      if (!price) return 0;
      const size = isPlot ? num(u.plotAreaCents) : unitAreaSqft(u, project.projectType);
      return size ? price / size : 0;
    })
    .filter((n) => n > 0);
  if (rates.length === 0) return null;
  return {
    label: isPlot ? "Rate per cent" : "Rate per sq.ft",
    value: `₹${inLakhs(Math.round(Math.min(...rates)))}`,
    note: rates.length > 1 ? "onwards" : undefined,
  };
}

export type Fact = {
  label: string;
  value: string;
  /** Second line: the qualifier that stops the number being read as exact. */
  note?: string;
};

/**
 * The fact rail: price, rate, what you get, how big, when.
 * Four to five cells — past that it stops being a glance and becomes a table,
 * which is what buildDetailRows is for.
 */
export function buildFacts(project: ProjectDetail): Fact[] {
  const isPlot = project.projectType === "plot";
  const possession = formatPossession(project.possessionDate);
  const statusLabel = titleCase(project.possessionStatus);
  const unitsOpen = project.units.filter((u) => u.status === "available").length;

  const facts: Fact[] = [
    {
      label: isPlot ? "Plot price" : "Price",
      value: priceRangeLabel(project),
      note: unitsOpen > 1 ? `across ${unitsOpen} units` : undefined,
    },
  ];

  const rate = rateFact(project);
  if (rate) facts.push(rate);

  if (isPlot) {
    const plots = plotSizeLabel(project);
    if (plots) facts.push({ label: "Plot sizes", value: plots });
    const dims = project.ranges.plotDimensions.filter(Boolean);
    if (dims.length > 0) {
      facts.push({
        label: "Dimensions",
        value: dims[0],
        note: dims.length > 1 ? `+${dims.length - 1} more` : undefined,
      });
    }
  } else {
    const config = configurationLabel(project);
    if (config) facts.push({ label: "Configurations", value: config });
    const area = areaRangeLabel(project);
    if (area) facts.push({ label: "Saleable area", value: area });
  }

  facts.push(
    possession
      ? { label: "Possession", value: possession, note: statusLabel }
      : { label: "Possession", value: statusLabel },
  );

  return facts;
}

export type DetailRow = { label: string; value: string };

/**
 * The spec sheet. Deliberately excludes every field the fact rail already
 * carries (price, rate, configurations, area, possession) — a buyer should
 * never have to work out whether two copies of a number agree.
 */
export function buildDetailRows(project: ProjectDetail): DetailRow[] {
  const isPlot = project.projectType === "plot";
  const rows: DetailRow[] = [
    { label: "Project type", value: projectTypeLabel(project.projectType) },
  ];

  if (project.totalUnits) {
    rows.push({ label: "Total units", value: `${project.totalUnits}` });
  }
  if (!isPlot && project.towers) {
    rows.push({
      label: "Towers",
      value: `${project.towers} ${project.towers === 1 ? "tower" : "towers"}`,
    });
  }
  if (!isPlot && project.totalFloors) {
    rows.push({ label: "Floors per tower", value: `${project.totalFloors}` });
  }
  const projectArea = num(project.projectAreaSqft);
  if (projectArea) {
    const acres = projectArea / 43560;
    rows.push({
      label: "Project area",
      value:
        acres >= 1
          ? `${parseFloat(acres.toFixed(2))} acres`
          : `${Math.round(projectArea).toLocaleString("en-IN")} sq.ft`,
    });
  }
  if (isPlot && project.ranges.plotBoundaryWall) {
    rows.push({ label: "Boundary wall", value: "Built" });
  }
  if (isPlot && project.ranges.plotOpenSides.length > 0) {
    // "1 or 3", not "1, 3" — these are the options across the plots on offer,
    // not three open sides on one plot.
    const sides = [...project.ranges.plotOpenSides].sort((a, b) => a - b);
    rows.push({
      label: "Open sides",
      value:
        sides.length === 1
          ? `${sides[0]}`
          : `${sides.slice(0, -1).join(", ")} or ${sides[sides.length - 1]}`,
    });
  }
  const facings = project.ranges.facings.filter(Boolean);
  if (facings.length > 0) {
    rows.push({
      label: facings.length === 1 ? "Facing" : "Facings available",
      value: facings.map((f) => titleCase(f)).join(", "),
    });
  }
  if (project.builderName) {
    rows.push({ label: "Developer", value: project.builderName });
  }
  if (project.reraNumber) {
    rows.push({ label: "RERA number", value: project.reraNumber });
  }
  if (project.projectCode) {
    rows.push({ label: "Project ID", value: project.projectCode });
  }

  return rows;
}

/** Amenity names for the overview teaser, deduplicated, in stored order. */
export function amenityNames(project: ProjectDetail): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const link of project.projectAmenities ?? []) {
    const name = link.amenity?.name?.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }
  return names;
}

/** Plot area as "3.5 cents (1,525 sq.ft)" — both units, because listings mix them. */
export function plotAreaCell(unit: ProjectUnit): string {
  const cents = num(unit.plotAreaCents);
  if (!cents) return "—";
  const sqft = Math.round(cents * CENT_TO_SQFT).toLocaleString("en-IN");
  return `${parseFloat(cents.toFixed(2))} cents (${sqft} sq.ft)`;
}

export function unitAreaCell(unit: ProjectUnit, projectType: string): string {
  if (projectType === "plot") return plotAreaCell(unit);
  const area = unitAreaSqft(unit, projectType);
  return area ? `${Math.round(area).toLocaleString("en-IN")} sq.ft` : "—";
}

export function unitLabel(unit: ProjectUnit): string {
  if (unit.bedrooms != null) return `${unit.bedrooms} BHK`;
  return unit.title || unit.unitCode || "Unit";
}

export function unitFurnishings(unit: ProjectUnit): string[] {
  return (unit.furnishingItems ?? [])
    .map((link) => link.furnishingItem?.name)
    .filter((name): name is string => !!name && name.trim() !== "");
}
