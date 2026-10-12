import { formatINR } from "@/lib/api/projects";
import type { ProjectDetail, ProjectUnit } from "@/lib/api/projects";
import { unitAreaLabel } from "@/lib/project-config-summary";
import { plotAreaCell, titleCase, unitFurnishings, unitRateLabel } from "@/lib/project-overview";

/**
 * A unit's spec sheet, split into the questions a buyer asks in turn: what
 * does it cost and how big is it, what rooms does it have, where is it in
 * the building, where does the car go, what comes with it. Each group is a
 * collapsed row on the floor plans page, so it carries a one-line preview
 * that answers the question without opening it.
 */

export type Spec = { label: string; value: string };

export type SpecGroupKey = "price" | "rooms" | "position" | "parking" | "furnishing" | "plot";

export type SpecGroup = {
  key: SpecGroupKey;
  title: string;
  /** Shown on the collapsed row: "₹6 Cr · 1,450 sq.ft". */
  preview: string | null;
  rows: Spec[];
  /** Room sizes, under Rooms. */
  rooms: { name: string; dimensions: string }[];
  /** Included furnishing items, under Furnishing. */
  items: string[];
};

function sqft(value: string | number | null | undefined): string | null {
  const n = parseFloat(String(value ?? ""));
  return Number.isFinite(n) && n > 0 ? `${Math.round(n).toLocaleString("en-IN")} sq.ft` : null;
}

function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

function rowsOf(entries: [string, string | null | undefined][]): Spec[] {
  return entries
    .filter((entry): entry is [string, string] => !!entry[1])
    .map(([label, value]) => ({ label, value }));
}

function joinPreview(parts: (string | null | undefined)[]): string | null {
  const kept = parts.filter((part): part is string => !!part);
  return kept.length > 0 ? kept.join(" · ") : null;
}

function group(
  key: SpecGroupKey,
  title: string,
  preview: string | null,
  rows: Spec[],
  extras: Partial<Pick<SpecGroup, "rooms" | "items">> = {},
): SpecGroup {
  return { key, title, preview, rows, rooms: extras.rooms ?? [], items: extras.items ?? [] };
}

/** Groups with nothing recorded are left out, not shown empty. */
const hasContent = (g: SpecGroup) => g.rows.length + g.rooms.length + g.items.length > 0;

export function unitSpecGroups(unit: ProjectUnit, project: ProjectDetail): SpecGroup[] {
  const priced = Number(unit.price) > 0;
  const price = priced ? formatINR(unit.price) : "On request";
  const rate = unitRateLabel(unit, project.projectType);
  const area = unitAreaLabel(unit, project.projectType);
  const facing = unit.facing ? titleCase(unit.facing) : null;

  if (project.projectType === "plot") {
    const plotArea = plotAreaCell(unit);
    const dimensions = (unit.roomDimensions ?? []).find((room) => room?.name === "Plot")?.dimensions;
    return [
      group(
        "price",
        "Price & plot",
        joinPreview([price, area]),
        rowsOf([
          ["Price", price],
          ["Rate", rate],
          ["Plot area", plotArea === "—" ? null : plotArea],
          ["Dimensions", dimensions],
        ]),
      ),
      group(
        "plot",
        "Plot features",
        joinPreview([
          facing ? `${facing} facing` : null,
          unit.openSides != null ? `${unit.openSides} open sides` : null,
        ]),
        rowsOf([
          ["Facing", facing],
          ["Open sides", unit.openSides != null ? `${unit.openSides}` : null],
          ["Boundary wall", unit.boundaryWall ? "Yes" : null],
        ]),
      ),
    ].filter(hasContent);
  }

  const rooms = (unit.roomDimensions ?? []).filter(
    (room): room is { name: string; dimensions: string } =>
      !!room?.name && room.name !== "Plot" && !!room.dimensions,
  );
  const items = unitFurnishings(unit);
  const floor =
    unit.floorNo != null
      ? unit.totalFloors
        ? `${unit.floorNo} of ${unit.totalFloors}`
        : `${unit.floorNo}`
      : null;
  const parkingType = unit.parkingType ? titleCase(String(unit.parkingType)) : null;
  const furnished = unit.furnishedStatus ? titleCase(unit.furnishedStatus) : null;

  return [
    group(
      "price",
      "Price & area",
      joinPreview([price, area]),
      rowsOf([
        ["Price", price],
        ["Rate", rate],
        ["Super built-up", sqft(unit.superBuiltupAreaSqft)],
        ["Built-up", sqft(unit.builtupAreaSqft)],
        ["Carpet", sqft(unit.carpetAreaSqft)],
        // UDS is an apartment-only measure. Villas quote plot and built-up instead.
        ["UDS", project.projectType === "apartment" ? sqft(unit.udsAreaSqft) : null],
      ]),
    ),
    group(
      "rooms",
      "Rooms",
      joinPreview([
        unit.bedrooms != null ? `${unit.bedrooms} bed` : null,
        unit.bathrooms != null ? `${unit.bathrooms} bath` : null,
        unit.balconies != null ? plural(unit.balconies, "balcony", "balconies") : null,
      ]),
      rowsOf([
        ["Bedrooms", unit.bedrooms != null ? `${unit.bedrooms}` : null],
        ["Bathrooms", unit.bathrooms != null ? `${unit.bathrooms}` : null],
        ["Balconies", unit.balconies != null ? `${unit.balconies}` : null],
        ["Pooja room", unit.poojaRoom ? "Yes" : null],
        ["Study room", unit.studyRoom ? "Yes" : null],
      ]),
      { rooms },
    ),
    group(
      "position",
      "Floor & facing",
      joinPreview([floor ? `Floor ${floor}` : null, facing ? `${facing} facing` : null]),
      rowsOf([
        ["Floor", floor],
        ["Facing", facing],
      ]),
    ),
    group(
      "parking",
      "Parking",
      joinPreview([
        unit.parking != null ? plural(unit.parking, "space") : null,
        parkingType,
        unit.unitGuestParking ? "Guest" : null,
      ]),
      rowsOf([
        ["Spaces", unit.parking != null ? `${unit.parking}` : null],
        ["Type", parkingType],
        ["Guest parking", unit.unitGuestParking ? "Yes" : null],
      ]),
    ),
    group(
      "furnishing",
      "Furnishing",
      joinPreview([furnished, items.length > 0 ? plural(items.length, "item") : null]),
      rowsOf([["Status", furnished]]),
      { items },
    ),
  ].filter(hasContent);
}
