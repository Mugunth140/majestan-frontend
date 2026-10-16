/**
 * "Popular Searches" in the footer, built from live inventory instead of a
 * hand-written list of localities, so every chip lands on a listing page
 * that actually has listings.
 *
 * The root layout aggregates the PSEO inventory snapshot into counts per
 * (Buy/Rent, type, city, locality) on the server; the footer then picks the
 * visitor's city out of those counts on the client.
 */

import { buildPseoSlug, PROPERTY_TYPES, toLocationSlug, type PropertyTypeSlug } from "@/lib/seo-urls";

/** One aggregated inventory bucket. Short keys: this ships on every page. */
export type InventoryCount = {
  /** "Sell" | "Rent" */
  l: "Sell" | "Rent";
  /** DB property type, e.g. "apartment" */
  t: string;
  /** City display name, e.g. "Coimbatore" */
  c: string;
  /** Locality display name, or null when the listing has none */
  s: string | null;
  /** Number of live listings in the bucket */
  n: number;
};

export type PopularLink = { label: string; href: string };

export type PopularGroup = {
  key: string;
  title: string;
  links: PopularLink[];
};

type InventoryRow = {
  listingType: string;
  propertyType: string;
  city: string | null;
  locality: string | null;
};

/** A category or link needs at least this many live listings to show. */
export const MIN_LISTINGS = 1;
/** Locality links per category; the rail scrolls, the cards don't. */
const MAX_LOCALITIES = 8;


const placeKey = (v: string | null | undefined) =>
  (v ?? "").toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();

/** DB type → URL slug, e.g. "individual_portion" → "independent-houses". */
const SLUG_BY_TYPE = new Map<string, PropertyTypeSlug>(
  (Object.entries(PROPERTY_TYPES) as [PropertyTypeSlug, { apiValue: string }][])
    .filter(([, v]) => v.apiValue)
    .map(([slug, v]) => [v.apiValue, slug]),
);

/** What people actually type: "Flats", not "Apartments". */
const TYPE_LABEL: Record<string, string> = {
  apartment: "Flats",
  villa: "Villas",
  individual_portion: "Independent Houses",
  plot: "Plots",
  farmland: "Farmlands",
  commercial: "Commercial Spaces",
  industrial: "Industrial Spaces",
  coworking: "Coworking Spaces",
};

/** Tie-break order when two categories have the same number of listings. */
const TYPE_ORDER = ["apartment", "villa", "individual_portion", "plot", "farmland", "commercial", "industrial", "coworking"];

/** Tidy "saravanampatti" / "SAI BABA COLONY" into "Sai Baba Colony". */
const displayName = (v: string) =>
  v.trim().replace(/\s+/g, " ").toLowerCase().replace(/\b\w/g, (ch) => ch.toUpperCase());

/**
 * Collapse raw inventory rows (one per listing) into counts per
 * (Buy/Rent, type, city, locality). Rows without a city or with a type
 * that has no listing URL are dropped.
 */
export function aggregateInventory(rows: InventoryRow[]): InventoryCount[] {
  const buckets = new Map<string, InventoryCount>();
  for (const row of rows) {
    const l = row.listingType === "Rent" ? "Rent" : row.listingType === "Sell" ? "Sell" : null;
    if (!l || !SLUG_BY_TYPE.has(row.propertyType) || !placeKey(row.city)) continue;
    const s = placeKey(row.locality) ? displayName(row.locality!) : null;
    const key = [l, row.propertyType, placeKey(row.city), placeKey(s)].join("|");
    const bucket = buckets.get(key);
    if (bucket) bucket.n += 1;
    else buckets.set(key, { l, t: row.propertyType, c: displayName(row.city!), s, n: 1 });
  }
  return [...buckets.values()];
}

/**
 * Every category ("Flats for Sale", "Commercial Spaces for Rent"…) the city
 * has listings in: Buy before Rent, busiest first within each. A category
 * links its busiest localities. Anything under MIN_LISTINGS listings is left out. Falls back
 * to the city with the most listings when the requested city has none.
 */
export function buildPopularSearches(
  counts: InventoryCount[],
  city: string | null | undefined,
): { city: string; groups: PopularGroup[] } | null {
  if (counts.length === 0) return null;

  let inCity = counts.filter((c) => placeKey(c.c) === placeKey(city));
  if (inCity.length === 0) {
    const totals = new Map<string, number>();
    for (const c of counts) totals.set(placeKey(c.c), (totals.get(placeKey(c.c)) ?? 0) + c.n);
    const busiest = [...totals.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
    inCity = counts.filter((c) => placeKey(c.c) === busiest);
  }
  const cityName = inCity[0].c;
  const citySlug = toLocationSlug(cityName);

  type Category = {
    l: "Sell" | "Rent";
    t: string;
    total: number;
    places: Map<string, { name: string; n: number }>;
  };
  const categories = new Map<string, Category>();
  for (const c of inCity) {
    const key = `${c.l}|${c.t}`;
    const cat = categories.get(key) ?? { l: c.l, t: c.t, total: 0, places: new Map() };
    cat.total += c.n;
    if (c.s) {
      const place = cat.places.get(placeKey(c.s)) ?? { name: c.s, n: 0 };
      place.n += c.n;
      cat.places.set(placeKey(c.s), place);
    }
    categories.set(key, cat);
  }

  const groups = [...categories.values()]
    .filter((cat) => cat.total >= MIN_LISTINGS)
    .sort(
      (a, b) =>
        (a.l === b.l ? 0 : a.l === "Sell" ? -1 : 1) ||
        b.total - a.total ||
        TYPE_ORDER.indexOf(a.t) - TYPE_ORDER.indexOf(b.t),
    )
    .map((cat): PopularGroup => {
      const typeSlug = SLUG_BY_TYPE.get(cat.t)!;
      const places = [...cat.places.values()]
        .filter((p) => p.n >= MIN_LISTINGS)
        .sort((a, b) => b.n - a.n || a.name.localeCompare(b.name))
        .slice(0, MAX_LOCALITIES);
      return {
        key: `${cat.l}-${cat.t}`,
        title: `${TYPE_LABEL[cat.t] ?? PROPERTY_TYPES[typeSlug].label} for ${cat.l === "Sell" ? "Sale" : "Rent"}`,
        links: places.map((p) => ({
          label: p.name,
          href: `/${buildPseoSlug(cat.l, typeSlug, citySlug, p.name)}`,
        })),
      };
    })
    // A category whose listings have no locality has nothing to link.
    .filter((group) => group.links.length > 0);

  return groups.length ? { city: cityName, groups } : null;
}
