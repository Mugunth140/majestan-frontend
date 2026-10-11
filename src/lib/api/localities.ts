import { API_BASE_URL, type Sublocation } from "@/lib/api";

type Envelope<T> = { success: boolean; data: T };

/** Managed sublocations with their editorial overview descriptions. */
export async function getLocalityOverviews(): Promise<Sublocation[]> {
  const res = await fetch(`${API_BASE_URL}/metadata/sublocations`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const payload = (await res.json()) as Envelope<Sublocation[]> | Sublocation[];
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object" && "data" in payload) {
    return Array.isArray(payload.data) ? payload.data : [];
  }
  return [];
}

/**
 * Match a free-text locality (e.g. "Saravanampatti main" from a listing
 * address) to a managed sublocation (e.g. "Saravanampatti").
 * Exact match first, then word-prefix fallback ("X main" → "X").
 * Prefers the same city when given.
 */
export function matchLocality(
  list: Sublocation[],
  locality: string,
  city?: string
): Sublocation | null {
  const needle = locality.trim().toLowerCase();
  if (!needle) return null;
  const norm = (s: string) => s.trim().toLowerCase();
  const exact = list.filter((s) => norm(s.sublocation) === needle);
  const prefixed = list.filter((s) => {
    const name = norm(s.sublocation);
    if (!name || name === needle) return false;
    return needle.startsWith(`${name} `) || needle.startsWith(`${name},`);
  });
  const named = [...exact, ...prefixed];
  if (named.length === 0) return null;
  if (city) {
    const inCity = named.find((s) => norm(s.city) === norm(city));
    if (inCity) return inCity;
  }
  return named[0];
}

/**
 * Server-side lookup of a locality's editorial description, or null.
 *
 * The project pages render this on the server so a section can decide to
 * exist before it ships: the client-side LocalityTeaser fetches after
 * hydration, which left a titled card with nothing under it whenever a
 * locality had no write-up. Cached for an hour — the copy changes when an
 * editor rewrites it in Admin, not per request.
 */
export async function getLocalityDescription(
  locality: string | null | undefined,
  city?: string | null,
): Promise<{ name: string; description: string } | null> {
  if (!locality || !locality.trim()) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/metadata/sublocations`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const payload = (await res.json()) as Envelope<Sublocation[]> | Sublocation[];
    const list = Array.isArray(payload)
      ? payload
      : Array.isArray(payload?.data)
        ? payload.data
        : [];
    const match = matchLocality(list, locality, city ?? undefined);
    const description = match?.description?.trim();
    return match && description ? { name: match.sublocation, description } : null;
  } catch {
    return null;
  }
}
