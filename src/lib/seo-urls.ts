// src/lib/seo-urls.ts

export const LISTING_TYPES = {
  SELL: "for-sale",
  RENT: "for-rent",
} as const;

// Map frontend URL slugs to backend API property types and readable labels
export const PROPERTY_TYPES = {
  properties: { apiValue: "", label: "Properties" },
  apartments: { apiValue: "apartment", label: "Apartments" },
  villas: { apiValue: "villa", label: "Villas" },
  "independent-houses": { apiValue: "independent-house", label: "Independent Houses" },
  plots: { apiValue: "plot", label: "Plots" },
  farmlands: { apiValue: "farmland", label: "Farmlands" },
  "commercial-spaces": { apiValue: "commercial-space", label: "Commercial Spaces" },
  "industrial-spaces": { apiValue: "industrial-space", label: "Industrial Spaces" },
  coworking: { apiValue: "coworking", label: "Coworking" },
} as const;

export type ListingTypeSlug = (typeof LISTING_TYPES)[keyof typeof LISTING_TYPES];
export type PropertyTypeSlug = keyof typeof PROPERTY_TYPES;

/**
 * Builds a canonical SEO URL for property listings.
 */
export function buildListingUrl(
  listingType: "sell" | "rent" | "Sell" | "Rent" | ListingTypeSlug,
  propertyType: PropertyTypeSlug | string,
  city: string,
  locality?: string
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

  const base = `/${normalizedListingType}/${normalizedPropertyType}/${city.toLowerCase()}`;
  return locality ? `${base}/${locality.toLowerCase()}` : base;
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

  const city = locationSegments[0] || "coimbatore";
  const locality = locationSegments[1] || undefined;
  // Join the rest if needed, or just use locality
  const fullLocation = locationSegments.join(" ");

  return {
    apiListingType: (isSale ? "Sell" : "Rent") as "Sell" | "Rent",
    apiPropertyType: propertyData.apiValue,
    propertyLabel: propertyData.label,
    city,
    locality,
    fullLocation,
  };
}
