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
