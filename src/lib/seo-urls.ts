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

// Property types that support bedroom (BHK) segmentation
export const BEDROOM_PROPERTY_TYPE_SLUGS: PropertyTypeSlug[] = [
  "apartments",
  "villas",
  "independent-houses",
];

// BHK options for PSEO page generation (1-BHK excluded from indexable PSEO pages)
export const PSEO_BEDROOM_OPTIONS = [2, 3, 4] as const;

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

// ---------------------------------------------------------------------------
// NEW CANONICAL PSEO URL FORMAT
// [N-bhk-]<propertyTypeSlug>-for-[sale|rent]-in-[sublocation-]<city>
//
// Examples:
//   apartments-for-sale-in-coimbatore
//   apartments-for-sale-in-saravanampatti-coimbatore
//   2-bhk-apartments-for-sale-in-saravanampatti-coimbatore
// ---------------------------------------------------------------------------

/**
 * Builds a canonical PSEO URL slug (no leading slash).
 * Returns just the slug string, e.g. "2-bhk-apartments-for-sale-in-saravanampatti-coimbatore"
 */
export function buildPseoSlug(
  listingType: "Sell" | "Rent",
  propertyTypeSlug: PropertyTypeSlug,
  city: string,
  sublocation?: string,
  bedrooms?: number
): string {
  const listingWord = listingType === "Sell" ? "for-sale" : "for-rent";
  const bhkPrefix =
    bedrooms && BEDROOM_PROPERTY_TYPE_SLUGS.includes(propertyTypeSlug)
      ? `${bedrooms}-bhk-`
      : "";
  const citySlug = toLocationSlug(city);
  const subSlug = sublocation ? toLocationSlug(sublocation) : "";
  const locationSuffix = subSlug ? `${subSlug}-${citySlug}` : citySlug;

  return `${bhkPrefix}${propertyTypeSlug}-${listingWord}-in-${locationSuffix}`;
}

export type ParsedPseoSlug = {
  listingType: "Sell" | "Rent";
  propertyType: string;       // DB API value e.g. "apartment"
  propertyTypeSlug: PropertyTypeSlug; // URL slug e.g. "apartments"
  propertyLabel: string;      // Human label e.g. "Apartments"
  city: string;               // e.g. "coimbatore"
  sublocation?: string;       // e.g. "saravanampatti" (slug form)
  bedrooms?: number;
};

/**
 * Parses a new-format PSEO slug back into its constituent parts.
 * Returns null if the slug does not match the PSEO pattern.
 *
 * Matches: [N-bhk-]<propertyTypeSlug>-for-[sale|rent]-in-<location>
 */
export function parsePseoSlug(slug: string): ParsedPseoSlug | null {
  if (!slug) return null;
  const s = slug.toLowerCase().trim();

  // 1. Extract optional BHK prefix: "N-bhk-..."
  let rest = s;
  let bedrooms: number | undefined;
  const bhkMatch = rest.match(/^(\d+)-bhk-(.+)$/);
  if (bhkMatch) {
    bedrooms = parseInt(bhkMatch[1], 10);
    rest = bhkMatch[2];
  }

  // 2. Find "-for-sale-in-" or "-for-rent-in-"
  const saleIdx = rest.indexOf("-for-sale-in-");
  const rentIdx = rest.indexOf("-for-rent-in-");
  let listingType: "Sell" | "Rent";
  let ptSlug: string;
  let locationPart: string;

  if (saleIdx !== -1) {
    listingType = "Sell";
    ptSlug = rest.slice(0, saleIdx);
    locationPart = rest.slice(saleIdx + "-for-sale-in-".length);
  } else if (rentIdx !== -1) {
    listingType = "Rent";
    ptSlug = rest.slice(0, rentIdx);
    locationPart = rest.slice(rentIdx + "-for-rent-in-".length);
  } else {
    return null;
  }

  // 3. Validate property type slug against PROPERTY_TYPES
  // "properties" (empty apiValue) is the valid All-Types slug — allow it so
  // /properties-for-sale-in-<city> renders instead of 404ing.
  const ptEntry = PROPERTY_TYPES[ptSlug as PropertyTypeSlug];
  if (!ptEntry) return null;

  // 4. Validate BHK only allowed for residential types
  if (bedrooms !== undefined && !BEDROOM_PROPERTY_TYPE_SLUGS.includes(ptSlug as PropertyTypeSlug)) {
    return null;
  }

  // 5. Parse location: last token is city, everything before is sublocation
  //    The slug uses toLocationSlug so tokens are already hyphen-joined.
  //    We need to split on "-" and figure out where city ends and sublocation begins.
  //    Strategy: city is always the LAST word (single word, no spaces).
  //    Sublocation = everything before the last "-"-separated token.
  //
  //    This works because our known cities are single words (coimbatore),
  //    and sublocations can be multi-word slugs (e.g. "rs-puram", "saravanampatti").
  if (!locationPart) return null;
  const locationTokens = locationPart.split("-");
  if (locationTokens.length === 0) return null;

  // city = last token
  const city = locationTokens[locationTokens.length - 1];
  const subSlug =
    locationTokens.length > 1
      ? locationTokens.slice(0, -1).join("-")
      : undefined;

  return {
    listingType,
    propertyType: ptEntry.apiValue,
    propertyTypeSlug: ptSlug as PropertyTypeSlug,
    propertyLabel: ptEntry.label,
    city,
    sublocation: subSlug,
    bedrooms,
  };
}

// ---------------------------------------------------------------------------
// LEGACY helpers — kept for backward compatibility with old routes during
// the 301-redirect transition. Do not use in new code.
// ---------------------------------------------------------------------------

/**
 * Builds the OLD-style canonical listing URL.
 * @deprecated Use buildPseoSlug for new canonical URLs.
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
  const BEDROOM_TYPES = ["apartments", "villas", "independent-houses"];
  const localityPart = locality ? `/${toLocationSlug(locality)}` : "";
  const bedroomPart =
    bedrooms && BEDROOM_TYPES.includes(normalizedPropertyType) ? `/${bedrooms}-bhk` : "";
  return `${base}${localityPart}${bedroomPart}`;
}

/**
 * Parses an array of path segments into listing search parameters.
 * Used by the old for-sale/for-rent routes to compute the 301 target.
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
    propertyTypeSlug: propertyTypeParam as PropertyTypeSlug,
    propertyLabel: propertyData.label,
    city,
    locality,
    fullLocation,
    bedrooms,
  };
}
