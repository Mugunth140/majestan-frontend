// Visibility of stacked sections on single-page property overviews.
// A section renders only when it has at least one data item — empty
// "coming soon" cards are never shown. Locality always renders (city map +
// context exist for every listing), so it is always included.

import {
  Box,
  Calendar,
  Compass,
  Droplets,
  Fence,
  Hash,
  Info,
  Landmark,
  Layers,
  Map,
  Milestone,
  Mountain,
  Maximize2,
  Ruler,
  Sprout,
  Tag,
  TreePine,
  Waves,
  type LucideIcon,
} from "lucide-react";
import type { SeoProperty } from "./api/property-by-slug";

export type SingleSectionId = "amenities" | "floor-plan" | "locality" | "photos";

function amenityCount(property: SeoProperty): number {
  return (
    property.amenities?.length ||
    (property as unknown as { propertyAmenities?: unknown[] }).propertyAmenities?.length ||
    0
  );
}

function floorPlanImageCount(property: SeoProperty): number {
  const fromUnits = (property.units ?? []).filter((u) => !!u.floorPlanImageUrl).length;
  return (
    (property.floorPlanFiles?.length || 0) +
    (property.details?.floorPlanImages?.length || 0) +
    fromUnits
  );
}

function hasMeasureData(property: SeoProperty): boolean {
  const d = property.details;
  return !!(d?.areaSqft || d?.bedrooms || d?.bathrooms || d?.parking);
}

/** Land types call the floor plan a ground plan. */
export function isGroundPlanType(propertyType: string): boolean {
  return propertyType === "plot" || propertyType === "farmland";
}

export function getFloorPlanLabel(propertyType: string): string {
  return isGroundPlanType(propertyType) ? "Ground Plan" : "Floor Plan";
}

function hasFloorPlanData(property: SeoProperty): boolean {
  if (floorPlanImageCount(property) > 0) return true;
  if ((property.details?.roomDimensions?.length || 0) > 0) return true;
  // Land types show the plan section only when a plan is actually
  // presented — bare measurements never render a ground-plan card.
  if (isGroundPlanType(property.propertyType)) return false;
  return hasMeasureData(property);
}

export type LandSpecRow = {
  label: string;
  value: string;
  icon: LucideIcon;
};

type LandDetails = Partial<NonNullable<SeoProperty["details"]>>;

function trimStr(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

function nzNum(v: unknown): number | null {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return !isNaN(n) && n > 0 ? n : null;
}

function trimNum(n: number): string {
  return String(parseFloat(n.toFixed(2)));
}

/** "40" × "60" (stored unit-less, captured in feet) → "40 × 60 ft". */
function landDimension(d: LandDetails): string | null {
  const direct = trimStr((d as Record<string, unknown>).dimension);
  if (direct) return direct;
  const len = nzNum(d.plotLength);
  const wid = nzNum(d.plotWidth);
  if (len != null && wid != null) return `${trimNum(len)} × ${trimNum(wid)} ft`;
  return null;
}

/** areaSqft counts as cents only when explicitly stored in cents. */
function areaSqftInCents(d: LandDetails): number | null {
  return /cent/i.test(String(d.areaUnit ?? "")) ? nzNum(d.areaSqft) : null;
}

function plotAreaRow(d: LandDetails): LandSpecRow | null {
  if (nzNum(d.plotArea) != null) {
    return { label: "Plot Area", value: `${Number(d.plotArea).toLocaleString("en-IN")} sq.ft`, icon: Maximize2 };
  }
  const cents = nzNum(d.plotSizeCents) ?? areaSqftInCents(d);
  if (cents != null) {
    return { label: "Plot Area", value: `${trimNum(cents)} cents`, icon: Maximize2 };
  }
  return null;
}

function farmAreaRow(d: LandDetails): LandSpecRow | null {
  const cents = nzNum(d.plotSizeCents) ?? areaSqftInCents(d);
  if (cents != null) {
    return { label: "Farm Area", value: `${trimNum(cents)} cents`, icon: Maximize2 };
  }
  if (nzNum(d.plotArea) != null) {
    if (/acre/i.test(String(d.areaUnit ?? ""))) {
      return { label: "Farm Area", value: `${trimNum(Number(d.plotArea))} acres`, icon: Maximize2 };
    }
    return { label: "Farm Area", value: `${trimNum(Number(d.plotArea))} cents`, icon: Maximize2 };
  }
  return null;
}

function waterRow(d: LandDetails): LandSpecRow | null {
  const water = trimStr(d.waterSources) ?? trimStr(d.irrigation);
  if (!water) return null;
  return {
    label: trimStr(d.waterSources) ? "Water Sources" : "Irrigation",
    value: water,
    icon: Droplets,
  };
}

function boundaryOrOpenSides(d: LandDetails, boundaryLabel: string): LandSpecRow[] {
  if (d.boundaryWall) return [{ label: boundaryLabel, value: "Yes", icon: Fence }];
  const openSides = nzNum(d.openSides);
  if (openSides != null) return [{ label: "Open Sides", value: String(openSides), icon: Box }];
  return [];
}

/**
 * Plot-relevant rows in priority order. Only stored values appear —
 * building rows (beds/baths/parking/furnishing) are never included.
 */
export function getPlotSpecs(details: LandDetails | null | undefined): LandSpecRow[] {
  if (!details) return [];
  const d = details;
  const rows: (LandSpecRow | null)[] = [
    plotAreaRow(d),
    (() => {
      const dim = landDimension(d);
      return dim ? { label: "Dimension", value: dim, icon: Ruler } : null;
    })(),
    trimStr(d.propertyFacing)
      ? { label: "Facing", value: trimStr(d.propertyFacing) as string, icon: Compass }
      : null,
    trimStr(d.plotType)
      ? { label: "Plot Type", value: trimStr(d.plotType) as string, icon: Tag }
      : null,
    trimStr(d.zoning)
      ? { label: "Zoning", value: trimStr(d.zoning) as string, icon: Landmark }
      : null,
    trimStr(d.roadWidth)
      ? { label: "Road Width", value: trimStr(d.roadWidth) as string, icon: Milestone }
      : null,
    waterRow(d),
    ...boundaryOrOpenSides(d, "Boundary Wall"),
    trimStr(d.suitableFor)
      ? { label: "Suitable For", value: trimStr(d.suitableFor) as string, icon: Info }
      : null,
    trimStr(d.landType)
      ? { label: "Land Type", value: trimStr(d.landType) as string, icon: Map }
      : null,
  ];
  return rows.filter((r): r is LandSpecRow => r !== null);
}

/**
 * Farmland carries richer agronomy data: soil, water and crop suitability
 * take precedence; facing is the fallback when crop data is absent.
 */
export function getFarmlandSpecs(details: LandDetails | null | undefined): LandSpecRow[] {
  if (!details) return [];
  const d = details;
  const crop = trimStr(d.cropSuitability);
  const fence = trimStr(d.fencing);
  const rows: (LandSpecRow | null)[] = [
    farmAreaRow(d),
    waterRow(d),
    crop ? { label: "Crop Suitability", value: crop, icon: Sprout } : null,
    trimStr(d.soilType)
      ? { label: "Soil Type", value: trimStr(d.soilType) as string, icon: Layers }
      : null,
    trimStr(d.landType)
      ? { label: "Land Type", value: trimStr(d.landType) as string, icon: Map }
      : null,
    trimStr(d.topography)
      ? { label: "Topography", value: trimStr(d.topography) as string, icon: Mountain }
      : null,
    trimStr(d.existingPlantation)
      ? {
          label: "Existing Plantation",
          value: trimStr(d.existingPlantation) as string,
          icon: TreePine,
        }
      : null,
    ...(d.boundaryWall
      ? [{ label: "Fencing", value: "Yes", icon: Fence } as LandSpecRow]
      : fence
        ? [{ label: "Fencing", value: fence, icon: Fence } as LandSpecRow]
        : boundaryOrOpenSides(d, "Fencing")),
    trimStr(d.sfNumber)
      ? { label: "SF Number", value: trimStr(d.sfNumber) as string, icon: Hash }
      : null,
    nzNum(d.plotNos) != null
      ? { label: "Plot No", value: String(trimNum(Number(d.plotNos))), icon: Hash }
      : null,
    trimStr(d.plotType)
      ? { label: "Plot Type", value: trimStr(d.plotType) as string, icon: Tag }
      : null,
    trimStr(d.zoning)
      ? { label: "Zoning", value: trimStr(d.zoning) as string, icon: Landmark }
      : null,
    d.boreWell ? { label: "Bore Well", value: "Yes", icon: Waves } : null,
    d.storageTank ? { label: "Storage Tank", value: "Yes", icon: Waves } : null,
    !crop && trimStr(d.propertyFacing)
      ? { label: "Facing", value: trimStr(d.propertyFacing) as string, icon: Compass }
      : null,
    trimStr(d.roadWidth)
      ? { label: "Road Width", value: trimStr(d.roadWidth) as string, icon: Milestone }
      : null,
    trimStr(d.propertyAge)
      ? { label: "Property Age", value: trimStr(d.propertyAge) as string, icon: Calendar }
      : null,
    trimStr(d.suitableFor)
      ? { label: "Suitable For", value: trimStr(d.suitableFor) as string, icon: Info }
      : null,
  ];
  return rows.filter((r): r is LandSpecRow => r !== null);
}

/**
 * Land price-per-unit: per cent when cents are known (plotSizeCents is
 * authoritative; areaSqft counts only when explicitly stored in cents).
 * Null when unknown — the caller falls back to per-sqft.
 */
export function getLandPricePerUnit(
  price: string,
  details: LandDetails | null | undefined,
  propertyType: string
): string | null {
  if (propertyType !== "plot" && propertyType !== "farmland") return null;
  const priceNum = parseFloat(price);
  if (!Number.isFinite(priceNum) || priceNum <= 0) return null;
  const d = details as unknown as Record<string, unknown> | null | undefined;
  const cents =
    nzNum(d?.plotSizeCents) ??
    (/cent/i.test(String(d?.areaUnit ?? "")) ? nzNum((d as Record<string, unknown>)?.areaSqft) : null);
  if (cents == null) return null;
  return `₹ ${Math.round(priceNum / cents).toLocaleString("en-IN")}/cent`;
}

export function getVisibleSingleSections(property: SeoProperty): SingleSectionId[] {
  const faqsFor = (section: string) =>
    (property.faqs || []).filter((f) => f.section === section);
  const out: SingleSectionId[] = [];
  if (amenityCount(property) > 0 || faqsFor("amenities").length > 0) {
    out.push("amenities");
  }
  if (hasFloorPlanData(property) || faqsFor("floor-plan").length > 0) {
    out.push("floor-plan");
  }
  out.push("locality");
  if ((property.images?.length || 0) > 0 || faqsFor("photos").length > 0) {
    out.push("photos");
  }
  return out;
}
