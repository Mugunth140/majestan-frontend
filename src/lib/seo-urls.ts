// src/lib/seo-urls.ts

export const LISTING_TYPES = {
  SELL: "for-sale",
  RENT: "for-rent",
} as const;

// Map frontend URL slugs to backend API property types and readable labels
// apiValue MUST match DB enum values in property.entity.ts:
//   'apartment','villa','plot','commercial','industrial','individual_portion','farmland','coworking','other'
export const PROPERTY_TYPES = {
  properties: { apiValue: "", label: "Properties" },
  apartments: { apiValue: "apartment", label: "Apartments" },
  villas: { apiValue: "villa", label: "Villas" },
  "independent-houses": { apiValue: "individual_portion", label: "Individual Houses" },
  plots: { apiValue: "plot", label: "Plots" },
  farmlands: { apiValue: "farmland", label: "Farmlands" },
  "commercial-spaces": { apiValue: "commercial", label: "Commercial Spaces" },
  "industrial-spaces": { apiValue: "industrial", label: "Industrial Spaces" },
  coworking: { apiValue: "coworking", label: "Coworking" },
} as const;

export type ListingTypeSlug = (typeof LISTING_TYPES)[keyof typeof LISTING_TYPES];
export type PropertyTypeSlug = keyof typeof PROPERTY_TYPES;

export function toLocationSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function fromLocationSlug(value: string): string {
  return decodeURIComponent(value).replace(/-/g, " ").trim();
}

/**
 * Builds a canonical SEO URL for property listings.
 */
export function buildListingUrl(
  listingType: "sell" | "rent" | "Sell" | "Rent" | ListingTypeSlug,
  propertyType: PropertyTypeSlug | string,
  city: string,
  locality?: string,
  bedrooms?: number
): string {
  // Normalize listing type
  const normalizedListingType =
    listingType.toLowerCase() === "sell" || listingType === LISTING_TYPES.SELL
      ? LISTING_TYPES.SELL
      : LISTING_TYPES.RENT;

  // Normalize property type (find slug if apiValue was passed)
  let normalizedPropertyType = propertyType.toLowerCase();
  
  // If an API value like 'apartment' was passed, convert to 'apartments'
  const foundEntry = Object.entries(PROPERTY_TYPES).find(
    ([slug, data]) => data.apiValue === normalizedPropertyType || slug === normalizedPropertyType
  );
  
  if (foundEntry) {
    normalizedPropertyType = foundEntry[0];
  }

  const base = `/${normalizedListingType}/${normalizedPropertyType}/${toLocationSlug(city)}`;
  const BEDROOM_TYPES = ['apartments', 'villas', 'independent-houses'];
  const localityPart = locality ? `/${toLocationSlug(locality)}` : '';
  const bedroomPart = (bedrooms && BEDROOM_TYPES.includes(normalizedPropertyType)) ? `/${bedrooms}-bhk` : '';
  return `${base}${localityPart}${bedroomPart}`;
}

/**
 * Parses an array of path segments into listing search parameters.
 */
export function parseListingUrl(
  listingTypeParam: string,
  propertyTypeParam: string,
  locationSegments: string[]
) {
  // Validate listing type
  const isSale = listingTypeParam === LISTING_TYPES.SELL;
  const isRent = listingTypeParam === LISTING_TYPES.RENT;
  
  if (!isSale && !isRent) return null;

  // Validate property type
  const propertyData = PROPERTY_TYPES[propertyTypeParam as PropertyTypeSlug];
  if (!propertyData) return null;

  const city = fromLocationSlug(locationSegments[0] || "coimbatore");
  const locality = locationSegments[1]
    ? fromLocationSlug(locationSegments[1])
    : undefined;
  // Extract bedroom from third segment (e.g. "2-bhk")
  let bedrooms: number | undefined;
  const bedroomSegment = locationSegments[2];
  if (bedroomSegment) {
    const match = bedroomSegment.match(/^(\d+)-bhk$/);
    if (match) {
      bedrooms = parseInt(match[1], 10);
    }
  }
  // Join the rest if needed, or just use locality
  const fullLocation = locationSegments.join(" ");

  return {
    apiListingType: (isSale ? "Sell" : "Rent") as "Sell" | "Rent",
    apiPropertyType: propertyData.apiValue,
    propertyLabel: propertyData.label,
    city,
    locality,
    fullLocation,
    bedrooms,
  };
}
