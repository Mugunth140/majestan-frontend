// site/majestan-frontend/src/lib/locality-geo.ts
// Pure locality helpers shared by server and client components.
//
// They MUST live here — not in LocalityGoogleMap.tsx. That file is a client
// module ("use client") and Next.js forbids calling client-module functions
// from a server component (LocalitySection calls resolveListingLocality).
// Dev mode does not enforce the boundary; production 500s on it.

export type LocationRow = {
  address?: string | null;
  landmark?: string | null;
};

/**
 * Builds the address sent to the geocoder: finest known area first, so a
 * listing without coordinates still lands on its locality rather than the
 * city centre. Pure so the fallback order stays pinned by tests.
 */
export function buildGeocodeQuery(
  locality: string | null | undefined,
  city: string,
  state?: string | null,
): string {
  const area = (locality ?? '').trim();
  const statePart = (state ?? '').trim();
  if (area) {
    return [area, city, statePart].filter(Boolean).join(', ');
  }
  return [city, statePart].filter(Boolean).join(', ');
}

/**
 * Best-effort locality name from a listing's location rows: first chunk of
 * the address, else the landmark. Null when there is nothing to go on.
 */
export function resolveListingLocality(
  locations?: Array<LocationRow> | null,
): string | null {
  const row = locations?.[0];
  const fromAddress = (row?.address || '').split(',')[0].trim();
  if (fromAddress) return fromAddress;
  const landmark = (row?.landmark || '').trim();
  return landmark || null;
}
