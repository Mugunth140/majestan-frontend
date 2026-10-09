/**
 * Per-type placeholder images for listings that have no photo (or whose
 * photo fails to load). Files live in `public/assets/placeholder/`.
 */

const BASE = "/assets/placeholder";

const BY_TYPE: Record<string, string> = {
  apartment: "Apartment.webp",
  villa: "Villa.webp",
  individual_portion: "Independent-house.webp",
  "independent-house": "Independent-house.webp",
  independenthouse: "Independent-house.webp",
  plot: "Plot.webp",
  farmland: "Farmland.webp",
  commercial: "Commercial.webp",
  "commercial-space": "Commercial.webp",
  industrial: "Industrial.webp",
  "industrial-space": "Industrial.webp",
  coworking: "Coworking.webp",
};

const DEFAULT_PLACEHOLDER = `${BASE}/Apartment.webp`;

function normalizeType(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

/**
 * Resolve the placeholder image for a listing. Accepts either a property
 * type or a project type (both share the same vocabulary). Unknown, empty
 * or missing types fall back to the generic apartment placeholder so callers
 * never have to branch.
 */
export function getPlaceholderImage(options?: {
  propertyType?: unknown;
  projectType?: unknown;
}): string {
  const key = normalizeType(options?.propertyType) || normalizeType(options?.projectType);
  const file = BY_TYPE[key];
  return file ? `${BASE}/${file}` : DEFAULT_PLACEHOLDER;
}

/** All known placeholder URLs (useful for preloading). */
export function getAllPlaceholderImages(): string[] {
  return Array.from(new Set(Object.values(BY_TYPE).map((file) => `${BASE}/${file}`)));
}
