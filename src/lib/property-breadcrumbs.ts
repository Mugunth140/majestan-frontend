import {
  PROPERTY_TYPES,
  buildPseoSlug,
  type PropertyTypeSlug,
} from "./seo-urls";

type BreadcrumbProperty = {
  listingType?: string | null;
  propertyType: string;
  city: string;
  title: string;
  canonicalSlug: string;
};

export type PropertyBreadcrumbItem = { label: string; href?: string };

/** Sale/rent comes from the listing type; status only says whether it is still available. */
export function isRentProperty(property: { listingType?: string | null }) {
  return String(property.listingType || "").trim().toLowerCase() === "rent";
}

function typeEntry(propertyType: string) {
  return Object.entries(PROPERTY_TYPES).find(
    ([, data]) => data.apiValue === propertyType,
  );
}

/**
 * The "<type>-for-sale-in-<city>" listing hub for a property. Unknown types
 * ("other") use the all-types page rather than pretending to be apartments.
 */
function listingHubs(property: BreadcrumbProperty) {
  const listingType = isRentProperty(property) ? "Rent" : "Sell";
  const city = property.city?.trim() || "coimbatore";
  const typeSlug = (typeEntry(property.propertyType)?.[0] || "properties") as PropertyTypeSlug;
  return { type: `/${buildPseoSlug(listingType, typeSlug, city)}` };
}

export function propertyBreadcrumbItems(
  property: BreadcrumbProperty,
): PropertyBreadcrumbItem[] {
  const rent = isRentProperty(property);
  const entry = typeEntry(property.propertyType);
  const typeLabel = entry?.[1].label || property.propertyType;
  const hubs = listingHubs(property);

  return [
    { label: rent ? "For Rent" : "For Sale", href: hubs.type },
    { label: typeLabel, href: hubs.type },
    { label: property.city, href: hubs.type },
    { label: property.title },
  ];
}

export function propertySectionBreadcrumbItems(
  property: BreadcrumbProperty,
  sectionLabel: string,
): PropertyBreadcrumbItem[] {
  const rent = isRentProperty(property);
  const entry = typeEntry(property.propertyType);
  const typeLabel = entry?.[1].label || property.propertyType;
  // Was the legacy /for-sale/<type>/<city> URL: an extra redirect, and a
  // homepage bounce for types without a listing slug ("other").
  const hubs = listingHubs(property);

  return [
    { label: rent ? "For Rent" : "For Sale", href: hubs.type },
    { label: typeLabel, href: hubs.type },
    { label: property.title, href: `/${property.canonicalSlug}` },
    { label: sectionLabel },
  ];
}
