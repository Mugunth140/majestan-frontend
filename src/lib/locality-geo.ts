// site/majestan-frontend/src/lib/locality-geo.ts
// Pure locality geography shared by server and client components.
//
// This file must stay dependency-free (no "use client", no browser APIs):
// it is imported from the server-rendered LocalitySection as well as the
// client map and search components. Anything touching `google.maps` lives
// with its caller, behind the Maps-JS load.

// ---------------------------------------------------------------------------
// Types shared with the Maps JS API shape (structural, no dependency).
// ---------------------------------------------------------------------------

export type LatLng = { lat: number; lng: number };

export type LocationRow = {
  address?: string | null;
  landmark?: string | null;
};

export type GeocoderLike = {
  geocode: (
    request: { address: string },
    callback: (
      results: Array<{ geometry: { location: { lat: () => number; lng: () => number } } }> | null,
      status: string,
    ) => void,
  ) => void;
};

// ---------------------------------------------------------------------------
// Query + name resolution.
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Distance.
// ---------------------------------------------------------------------------

/** Great-circle distance in kilometres between two points. */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const earthKm = 6371;
  const a =
    Math.sin(toRad(lat2 - lat1) / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(toRad(lng2 - lng1) / 2) ** 2;
  return 2 * earthKm * Math.asin(Math.sqrt(a));
}

/** Human distance label. Straight-line, hence the tilde. */
export function formatDistanceKm(km: number): string {
  return km < 10 ? `~${km.toFixed(1)} km` : `~${Math.round(km)} km`;
}

// ---------------------------------------------------------------------------
// Async resolution (geocoder injected, so tests never touch google.maps).
// ---------------------------------------------------------------------------

/** Promise wrapper over the callback-style Geocoder. Null when unmatched. */
export function geocodeAddress(
  geocoder: GeocoderLike,
  address: string,
): Promise<LatLng | null> {
  return new Promise((resolve) => {
    try {
      geocoder.geocode({ address }, (results, status) => {
        const location = results?.[0]?.geometry?.location;
        if (status === 'OK' && location) {
          resolve({ lat: location.lat(), lng: location.lng() });
        } else {
          resolve(null);
        }
      });
    } catch {
      resolve(null);
    }
  });
}

export type PropertyCenter = LatLng & { approximate: boolean };

/**
 * Where "the property" is for distance purposes: exact coordinates when
 * stored, else the geocoded locality (marked approximate), else null.
 */
export async function resolvePropertyCenter(
  input: {
    lat?: string | number | null;
    lng?: string | number | null;
    locality?: string | null;
    city: string;
    state?: string | null;
  },
  geocode: (address: string) => Promise<LatLng | null>,
): Promise<PropertyCenter | null> {
  const lat = input.lat === null || input.lat === undefined || input.lat === '' ? NaN : Number(input.lat);
  const lng = input.lng === null || input.lng === undefined || input.lng === '' ? NaN : Number(input.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { lat, lng, approximate: false };
  }
  const hit = await geocode(buildGeocodeQuery(input.locality, input.city, input.state));
  if (!hit) return null;
  return { ...hit, approximate: true };
}
