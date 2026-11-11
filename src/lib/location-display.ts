export type LocationParts = {
  sublocation?: string | null;
  city?: string | null;
  state?: string | null;
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
      nested?.postal_code ??
      sublocationPincode(location.sublocation),
  );
}

function sublocationPincode(value: unknown): unknown {
  if (!value || typeof value !== "object") return undefined;
  const sub = value as LocationRecord;
  return sub.postalCode ?? sub.postal_code ?? sub.pincode;
}

const STREET_FIELDS = ["address", "landmark", "addressLine1", "addressLine2"];

/**
 * Public pages show only locality, city, state and pincode, so the street
 * address must not reach the browser either (it would sit in the page data).
 * Drops street fields from the record and its location rows.
 */
export function withoutStreetAddress<T>(record: T): T {
  if (!record || typeof record !== "object") return record;
  const out = { ...(record as Record<string, unknown>) };
  for (const key of STREET_FIELDS) if (key in out) out[key] = null;
  for (const key of ["locations", "propertyLocations", "__propertyLocations__"]) {
    const rows = out[key];
    if (Array.isArray(rows)) {
      out[key] = rows.map((row) => {
        if (!row || typeof row !== "object") return row;
        const copy = { ...(row as Record<string, unknown>) };
        for (const f of STREET_FIELDS) if (f in copy) copy[f] = null;
        return copy;
      });
    }
  }
  return out as T;
}

function uniqueParts(parts: string[]): string[] {
  return parts.filter(
    (part, index) =>
      parts.findIndex((candidate) => candidate.toLowerCase() === part.toLowerCase()) === index,
  );
}

export function formatLocationLine({ sublocation, city, state, pincode }: LocationParts): string {
  return uniqueParts([clean(sublocation), clean(city), clean(state), clean(pincode)].filter(Boolean)).join(", ");
}

export function capFirst(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/**
 * Where a listing is, as the public sees it: locality, city, state and pincode.
 * The street address is never shown on the website.
 */
export function formatAddressLines(location: LocationParts): string[] {
  const locationLine = formatLocationLine(location);
  return locationLine ? [locationLine] : [];
}
