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

export function propertyBreadcrumbItems(
  property: BreadcrumbProperty,
): PropertyBreadcrumbItem[] {
  const rent = isRentProperty(property);
  const entry = typeEntry(property.propertyType);
  const ptSlug = (entry?.[0] || "apartments") as PropertyTypeSlug;
  const typeLabel = entry?.[1].label || property.propertyType;

  // Canonical PSEO hub for the parent breadcrumb
  const parentSlug = buildPseoSlug(
    rent ? "Rent" : "Sell",
    ptSlug,
    property.city.toLowerCase(),
  );

  return [
    { label: rent ? "For Rent" : "For Sale", href: `/${parentSlug}` },
    { label: typeLabel, href: `/${parentSlug}` },
    { label: property.city, href: `/${parentSlug}` },
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
  const hub = `/${rent ? "for-rent" : "for-sale"}/${entry?.[0] || property.propertyType}/${property.city.toLowerCase()}`;

  return [
    { label: rent ? "For Rent" : "For Sale", href: hub },
    { label: typeLabel, href: hub },
    { label: property.title, href: `/${property.canonicalSlug}` },
    { label: sectionLabel },
  ];
}
