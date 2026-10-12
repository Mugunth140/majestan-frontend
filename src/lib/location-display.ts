export type LocationParts = {
  sublocation?: string | null;
  city?: string | null;
  pincode?: string | number | null;
};

export type LocationRecord = {
  address?: unknown;
  landmark?: unknown;
  name?: unknown;
  locality?: unknown;
  localityName?: unknown;
  locality_name?: unknown;
  sublocation?: LocationRecord | unknown;
  subLocation?: unknown;
  pincode?: unknown;
  postalCode?: unknown;
  postal_code?: unknown;
  localityData?: LocationRecord | null;
};

function clean(value: unknown): string {
  return value == null ? "" : String(value).trim();
}

// A full street address has 2+ commas; a locality almost never does. Digits
// alone prove nothing ("Sector 62", "Phase 7" are localities).
function isLikelyFullAddress(value: string): boolean {
  return (value.match(/,/g)?.length ?? 0) > 1;
}

export function getSublocation(location: LocationRecord | null | undefined): string {
  if (!location) return "";
  const nested = location.localityData;
  const related = location.sublocation;
  const relatedRecord =
    typeof related === "object" && related !== null ? (related as LocationRecord) : undefined;
  const candidates = [
    relatedRecord?.localityName,
    relatedRecord?.locality_name,
    location.sublocation,
    location.subLocation,
    location.locality,
    location.localityName,
    location.locality_name,
    nested?.sublocation,
    nested?.subLocation,
    nested?.locality,
    nested?.localityName,
    location.name,
  ];
  const value = candidates
    .map((candidate) => (typeof candidate === "object" ? "" : clean(candidate)))
    .find((candidate) => candidate && !isLikelyFullAddress(candidate));
  return value ?? "";
}

export function getPincode(location: LocationRecord | null | undefined): string {
  if (!location) return "";
  const nested = location.localityData;
  return clean(
    location.pincode ??
      location.postalCode ??
      location.postal_code ??
      nested?.pincode ??
      nested?.postalCode ??
      nested?.postal_code,
  );
}

function uniqueParts(parts: string[]): string[] {
  return parts.filter(
    (part, index) =>
      parts.findIndex((candidate) => candidate.toLowerCase() === part.toLowerCase()) === index,
  );
}

export function formatLocationLine({ sublocation, city, pincode }: LocationParts): string {
  return uniqueParts([clean(sublocation), clean(city), clean(pincode)].filter(Boolean)).join(", ");
}

export function capFirst(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export function formatAddressLines(
  fullAddress: string | null | undefined,
  location: LocationParts,
): string[] {
  const address = clean(fullAddress);
  const locationLine = formatLocationLine(location);
  return [address, locationLine].filter(Boolean);
}
