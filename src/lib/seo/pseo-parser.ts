export type ParsedPseoData = {
  propertyType?: string;
  listingType?: string;
  location?: string;
  bedrooms?: string;
  city?: string;
};

// Example mappings
const PROPERTY_TYPE_MAP: Record<string, string> = {
  "flats": "apartment",
  "apartments": "apartment",
  "villas": "villa",
  "houses": "independent-house",
  "plots": "plot",
  "commercial": "commercial-space",
  "coworking": "coworking",
};

const LISTING_TYPE_MAP: Record<string, string> = {
  "for-sale": "Sell",
  "for-rent": "Rent",
};

export const parsePseoSlug = (slug: string): ParsedPseoData | null => {
  // Try to match patterns like "flats-in-hinjewadi-pune"
  // or "2-bhk-flats-in-hinjewadi-pune"
  // Let's implement a basic regex parser

  let propertyType: string | undefined;
  let listingType: string | undefined;
  let location: string | undefined;
  let city: string | undefined;
  let bedrooms: string | undefined;

  // Pattern: [bhk]-flats-for-[sale/rent]-in-[locality]-[city]
  // We can simplify by extracting keywords
  const parts = slug.toLowerCase().split("-");

  // Check for BHK
  const bhkIndex = parts.indexOf("bhk");
  if (bhkIndex > 0) {
    bedrooms = parts[bhkIndex - 1]; // e.g., "2"
  }

  // Check for listing type
  if (parts.includes("sale")) listingType = "Sell";
  if (parts.includes("rent")) listingType = "Rent";

  // Check for property type
  for (const [key, val] of Object.entries(PROPERTY_TYPE_MAP)) {
    if (parts.includes(key)) {
      propertyType = val;
      break;
    }
  }

  // Check for "in" to find location/city
  const inIndex = parts.indexOf("in");
  if (inIndex !== -1 && inIndex < parts.length - 1) {
    const afterIn = parts.slice(inIndex + 1);
    
    // If it's something like "hinjewadi-pune", we might assume the last part is city, rest is locality
    if (afterIn.length >= 2) {
      city = afterIn[afterIn.length - 1];
      location = afterIn.slice(0, afterIn.length - 1).join("-");
    } else if (afterIn.length === 1) {
      city = afterIn[0]; // Just the city
    }
  }

  if (propertyType && city) {
    return {
      propertyType,
      listingType: listingType || "Sell", // Default to Sell if unspecified
      location,
      city,
      bedrooms
    };
  }

  return null;
};
