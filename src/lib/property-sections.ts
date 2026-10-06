// Visibility of stacked sections on single-page property overviews.
// A section renders only when it has at least one data item — empty
// "coming soon" cards are never shown. Locality always renders (city map +
// context exist for every listing), so it is always included.

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
