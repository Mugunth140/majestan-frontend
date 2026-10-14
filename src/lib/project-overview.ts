import { CENT_TO_SQFT, formatINRRange } from "@/lib/api/projects";
import type { ProjectDetail, ProjectFurnishingItem, ProjectUnit } from "@/lib/api/projects";

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

/**
 * The CRM has exactly three possession states. Mapped explicitly rather than
 * title-cased from the enum, which produced "Ready To Move".
 */
const POSSESSION_LABEL: Record<string, string> = {
  new_launch: "New Launch",
  under_construction: "Under Construction",
  ready_to_move: "Ready to Move",
};

export function possessionLabel(status: string): string {
  return POSSESSION_LABEL[status] ?? titleCase(status);
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

/** Only built homes are furnished; plots come unbuilt, so the CRM records none. */
export function hasFurnishing(projectType: string): boolean {
  return projectType === "apartment" || projectType === "villa";
}

/** The amenities sub-page's name: it also holds furnishing, except for plots. */
export function amenitiesPageLabel(projectType: string): string {
  return hasFurnishing(projectType) ? "Amenities & Furnishing" : "Amenities";
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
  return formatINRRange(project.ranges.minPrice, project.ranges.maxPrice);
}

/**
 * Range of a numeric series as "low – high unit", or "value unit". The unit is
 * written once, after the range: "1,400 sq.ft – 1,800 sq.ft" wrapped onto two
 * lines in a fact-rail cell, and repeating it adds nothing a reader needs.
 */
function rangeOf(
  values: number[],
  format: (n: number) => string,
  unit: string,
): string | null {
  if (values.length === 0) return null;
  const low = Math.min(...values);
  const high = Math.max(...values);
  return low === high
    ? `${format(low)} ${unit}`
    : `${format(low)} – ${format(high)} ${unit}`;
}

/**
 * Built-up area per unit, so the number matches the fact rail's label. Falls
 * back to super built-up, then carpet, only for a unit with no built-up
 * figure recorded, rather than dropping that unit from the range.
 */
export function builtUpAreaSqft(unit: ProjectUnit): number {
  return (
    num(unit.builtupAreaSqft) ||
    num(unit.superBuiltupAreaSqft) ||
    num(unit.carpetAreaSqft)
  );
}

export function areaRangeLabel(project: ProjectDetail): string | null {
  const areas = sellableUnits(project)
    .map((u) => builtUpAreaSqft(u))
    .filter((n) => n > 0);
  return rangeOf(areas, (n) => Math.round(n).toLocaleString("en-IN"), "sq.ft");
}

export function plotSizeLabel(project: ProjectDetail): string | null {
  const cents = sellableUnits(project)
    .map((u) => num(u.plotAreaCents))
    .filter((n) => n > 0);
  return rangeOf(cents, (n) => `${parseFloat(n.toFixed(2))}`, "cents");
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
 * The fact rail: price, what you get, how big, when. The rate lives in the
 * enquiry card instead, beside the price it is derived from.
 * Four to five cells — past that it stops being a glance and becomes a table,
 * which is what buildDetailRows is for.
 */
export function buildFacts(project: ProjectDetail): Fact[] {
  const isPlot = project.projectType === "plot";
  const facts: Fact[] = [
    { label: isPlot ? "Plot price" : "Price", value: priceRangeLabel(project) },
  ];

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
    if (area) facts.push({ label: "Built-up area", value: area });
  }

  // The status only. The expected date, when there is one, is in the about
  // section's details, so the rail stays one value per cell.
  facts.push({ label: "Possession", value: possessionLabel(project.possessionStatus) });

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

  // Ready-to-move stock has no date to wait for.
  const possessionDate = formatPossession(project.possessionDate);
  if (possessionDate && project.possessionStatus !== "ready_to_move") {
    rows.push({ label: "Possession date", value: possessionDate });
  }
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

/**
 * A unit's furnishing items. The API sends the items themselves, but the
 * type once promised link rows wrapping them, so both shapes are read.
 */
type FurnishingLink = { furnishingItem?: ProjectFurnishingItem | null };

function isFurnishingLink(entry: ProjectFurnishingItem | FurnishingLink): entry is FurnishingLink {
  return "furnishingItem" in entry;
}

export function unitFurnishingItems(unit: ProjectUnit): ProjectFurnishingItem[] {
  return (unit.furnishingItems ?? []).flatMap((entry) => {
    const item = entry && isFurnishingLink(entry) ? entry.furnishingItem : entry;
    return item?.name?.trim() ? [{ ...item, name: item.name.trim() }] : [];
  });
}

export function unitFurnishings(unit: ProjectUnit): string[] {
  return unitFurnishingItems(unit).map((item) => item.name);
}

export type ConfigurationGroup = {
  /** Stable id: "bhk-2", "cents-4", or "other-<title or unit type>". */
  key: string;
  /** "2 BHK", "4 cents", or a fallback label for units with no bedroom count. */
  label: string;
  /** Lowest positive price in the group, or null when none is priced. */
  minPrice: number | null;
  /** Available units first, then the rest, each in stored order. */
  units: ProjectUnit[];
};

export type UnitFloorPlan = { floorName: string; imageUrl: string };

/** Prefer named floor plans; older project units still expose one unnamed plan. */
export function unitFloorPlans(unit: ProjectUnit): UnitFloorPlan[] {
  if (unit.floorPlans != null) {
    return unit.floorPlans.flatMap((plan) => {
      const imageUrl = plan.imageUrl?.trim();
      const floorName = plan.floorName?.trim();
      return imageUrl ? [{ floorName: floorName || "Floor plan", imageUrl }] : [];
    });
  }
  return unit.floorPlanImageUrl
    ? [{ floorName: "Floor plan", imageUrl: unit.floorPlanImageUrl }]
    : [];
}

/** Overview teasers link back to the exact unit and floor they preview. */
export function projectFloorPlanHref(
  slug: string,
  unitId: number,
  floorName: string,
): string {
  const query = new URLSearchParams({ unitId: String(unitId), floor: floorName });
  return `/${slug}/floor-plans?${query.toString()}`;
}

type ConfigurationSlot = { key: string; label: string; sortValue: number | null };

/**
 * Buyers shop by configuration ("show me the 3 BHKs"), so units are grouped
 * on the axis they compare on: bedrooms for flats and villas, land area for
 * plots. A unit without bedrooms falls back to its own title, because
 * lumping every bedroom-less unit into one "Other" bucket would hide the
 * difference between, say, a villa and a penthouse.
 */
function configurationOf(unit: ProjectUnit, isPlot: boolean): ConfigurationSlot {
  if (isPlot) {
    const cents = Math.round(num(unit.plotAreaCents) * 100) / 100;
    if (!cents) return { key: "plot", label: "Plot", sortValue: null };
    return { key: `cents-${cents}`, label: `${cents} cents`, sortValue: cents };
  }
  if (unit.bedrooms != null) {
    return {
      key: `bhk-${unit.bedrooms}`,
      label: `${unit.bedrooms} BHK`,
      sortValue: unit.bedrooms,
    };
  }
  const title = unit.title?.trim();
  const type = (unit.unitType ?? "").trim();
  return {
    key: `other-${(title || type || "other").toLowerCase().replace(/\s+/g, "-")}`,
    label: title || (type ? titleCase(type) : "Other"),
    sortValue: null,
  };
}

/**
 * Groups units by configuration, numeric groups first in ascending order and
 * named groups after them, alphabetically. Within each group, units still on
 * sale come first: a buyer scanning a 3 BHK wants the ones they can book, and
 * sold stock stays visible without pushing them off the top.
 */
export function groupUnitsByConfiguration(project: ProjectDetail): ConfigurationGroup[] {
  const isPlot = project.projectType === "plot";
  const buckets = new Map<
    string,
    { label: string; sortValue: number | null; units: ProjectUnit[] }
  >();

  for (const unit of project.units) {
    const { key, label, sortValue } = configurationOf(unit, isPlot);
    const bucket = buckets.get(key);
    if (bucket) bucket.units.push(unit);
    else buckets.set(key, { label, sortValue, units: [unit] });
  }

  return [...buckets.entries()]
    .map(([key, bucket]) => ({ key, ...bucket }))
    .sort((a, b) => {
      if (a.sortValue != null && b.sortValue != null) return a.sortValue - b.sortValue;
      if (a.sortValue != null) return -1;
      if (b.sortValue != null) return 1;
      return a.label.localeCompare(b.label);
    })
    .map(({ key, label, units }) => {
      const open = units.filter((u) => u.status === "available");
      const rest = units.filter((u) => u.status !== "available");
      // "from" on a tab is a price someone can still pay: priced from open
      // stock while any exists, the same fallback sellableUnits applies to
      // the page's headline price. A sold 2 BHK at an old launch price would
      // otherwise advertise a number nobody can book at.
      const prices = (open.length > 0 ? open : units)
        .map((u) => num(u.price))
        .filter((n) => n > 0);
      return {
        key,
        label,
        minPrice: prices.length > 0 ? Math.min(...prices) : null,
        units: [...open, ...rest],
      };
    });
}

/**
 * Price per the size a buyer compares on: per cent for plots, per sq.ft for
 * everything else. Null when either half is missing, rather than a rate
 * built on a zero denominator, which would read as a real price.
 */
export function unitRateLabel(unit: ProjectUnit, projectType: string): string | null {
  const price = num(unit.price);
  if (!price) return null;
  if (projectType === "plot") {
    const cents = num(unit.plotAreaCents);
    if (!cents) return null;
    return `₹${Math.round(price / cents).toLocaleString("en-IN")} / cent`;
  }
  const area = unitAreaSqft(unit, projectType);
  if (!area) return null;
  return `₹${Math.round(price / area).toLocaleString("en-IN")} / sq.ft`;
}

export type ProjectCoordinates = { lat: number; lon: number };

/**
 * The project's pin, when the CRM has one. The API sends decimals as strings,
 * so they are parsed and range-checked; a half-set or out-of-range pair is
 * treated as no pin rather than shown.
 */
export function projectCoordinates(project: ProjectDetail): ProjectCoordinates | null {
  if (project.latitude == null || project.longitude == null) return null;
  const lat = Number(project.latitude);
  const lon = Number(project.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  if (lat === 0 && lon === 0) return null;
  return { lat, lon };
}

/** "2", "2 – 3": a whole-number range across the units, or null when none set it. */
function countRange(values: (number | null | undefined)[]): string | null {
  const set = [...new Set(values.filter((v): v is number => typeof v === "number" && v > 0))].sort((a, b) => a - b);
  if (set.length === 0) return null;
  return set.length === 1 ? `${set[0]}` : `${set[0]} – ${set[set.length - 1]}`;
}

function sqftRange(values: number[]): string | null {
  const set = values.filter((v) => v > 0);
  if (set.length === 0) return null;
  const lo = Math.min(...set);
  const hi = Math.max(...set);
  const fmt = (v: number) => Math.round(v).toLocaleString("en-IN");
  return lo === hi ? `${fmt(lo)} sq.ft` : `${fmt(lo)} – ${fmt(hi)} sq.ft`;
}

/** "All units", "Some units", or null when no unit has the room. */
function roomPresence(units: ProjectUnit[], has: (unit: ProjectUnit) => boolean | null | undefined): string | null {
  const count = units.filter((unit) => has(unit)).length;
  if (count === 0) return null;
  return count === units.length ? "In every unit" : "In select units";
}

/**
 * The about section's full spec sheet: the project-level details, then what
 * the units add up to — rooms, parking, carpet and UDS area, floors and
 * maintenance. Nothing here repeats the key-facts band (price, BHK mix,
 * built-up area, possession status).
 */
export function buildAboutRows(project: ProjectDetail): DetailRow[] {
  const rows = buildDetailRows(project);
  const isPlot = project.projectType === "plot";
  const units = project.units ?? [];
  const add = (label: string, value: string | null) => {
    if (value) rows.push({ label, value });
  };

  const available = units.filter((unit) => unit.status === "available").length;
  if (units.length > 0) add("Units on sale", `${available} of ${units.length} listed`);

  if (!isPlot && units.length > 0) {
    add("Bathrooms", countRange(units.map((u) => u.bathrooms)));
    add("Balconies", countRange(units.map((u) => u.balconies)));
    add("Carpet area", sqftRange(units.map((u) => num(u.carpetAreaSqft))));
    add("UDS area", sqftRange(units.map((u) => num(u.udsAreaSqft))));

    const parking = countRange(units.map((u) => u.parking));
    const parkingTypes = [...new Set(units.map((u) => u.parkingType?.trim()).filter(Boolean))].map((t) => titleCase(t!));
    if (parking) {
      add("Car parking", `${parking} ${parking === "1" ? "slot" : "slots"}${parkingTypes.length ? ` · ${parkingTypes.join(", ")}` : ""}`);
    }
    if (units.some((u) => u.unitGuestParking)) add("Guest parking", "Available");
    add("Pooja room", roomPresence(units, (u) => u.poojaRoom));
    add("Study room", roomPresence(units, (u) => u.studyRoom));

    const furnished = [...new Set(units.map((u) => u.furnishedStatus).filter(Boolean))].map((s) => titleCase(s!));
    if (furnished.length > 0) add("Furnishing", furnished.join(" or "));

    const floors = [...new Set(units.map((u) => `${u.floorNo ?? ""}`.trim()).filter(Boolean))];
    if (floors.length > 0 && floors.length <= 4) add(floors.length === 1 ? "Floor" : "Floors", floors.join(", "));
  }

  const maintenance = units.map((u) => num(u.maintenanceFee)).filter((v) => v > 0);
  if (maintenance.length > 0) {
    const lo = Math.min(...maintenance);
    const hi = Math.max(...maintenance);
    const fmt = (v: number) => `₹${Math.round(v).toLocaleString("en-IN")}`;
    add("Maintenance", lo === hi ? fmt(lo) : `${fmt(lo)} – ${fmt(hi)}`);
  }

  const availableFrom = units
    .map((u) => u.availableFrom)
    .filter((d): d is string => Boolean(d))
    .sort()[0];
  if (availableFrom) add("Available from", formatPossession(availableFrom));

  return rows;
}
