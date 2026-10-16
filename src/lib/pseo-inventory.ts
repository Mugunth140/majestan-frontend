/**
 * src/lib/pseo-inventory.ts
 *
 * Inventory eligibility check for PSEO page generation.
 * Used by sitemap.ts and [slug]/page.tsx generateStaticParams to gate
 * which PSEO combinations get generated/indexed.
 *
 * The threshold is configurable via the MIN_PSEO_INVENTORY env var (default 1).
 * Set it higher (e.g. 3) to require more inventory before a PSEO page is created.
 */

export const MIN_PSEO_INVENTORY = parseInt(
  process.env.MIN_PSEO_INVENTORY || "1",
  10
);

// How many inventory checks to run in parallel.
// Keep this small to avoid 429 errors from the backend during generateStaticParams.
export const PSEO_INVENTORY_BATCH_SIZE = parseInt(
  process.env.PSEO_INVENTORY_BATCH_SIZE || "5",
  10
);

// Delay in ms between batches to give the backend breathing room.
export const PSEO_INVENTORY_BATCH_DELAY_MS = parseInt(
  process.env.PSEO_INVENTORY_BATCH_DELAY_MS || "200",
  10
);

const _abs = (u: string | undefined) =>
  !!u && /^https?:\/\//i.test(u) ? u : undefined;

const API_BASE =
  _abs(process.env.API_BASE_URL) ||
  _abs(process.env.NEXT_PUBLIC_API_BASE_URL) ||
  "http://localhost:5000/api/v1";

// Map frontend property-type slugs to DB API values (duplicated here so this
// module has no import-time side-effects from seo-urls.ts, which is safe to
// import too, but keeping this self-contained avoids any edge-case bundling
// issues in server-only inventory checks).
const PSEO_API_TYPE_MAP: Record<string, string> = {
  properties: "",
  apartments: "apartment",
  villas: "villa",
  "independent-houses": "individual_portion",
  plots: "plot",
  farmlands: "farmland",
  "commercial-spaces": "commercial",
  "industrial-spaces": "industrial",
  coworking: "coworking",
};

export interface PseoCheckParams {
  /** "Sell" or "Rent" */
  listingType: "Sell" | "Rent";
  /** Property type URL slug, e.g. "apartments" */
  propertyTypeSlug: string;
  /** City name slug, e.g. "coimbatore" */
  city: string;
  /** Sublocation slug, e.g. "saravanampatti" (optional) */
  sublocation?: string;
  /** Number of bedrooms (optional, residential only) */
  bedrooms?: number;
}

/**
 * Returns true if the matching inventory count is >= MIN_PSEO_INVENTORY.
 * Fetches with ISR caching (1 hour) so build-time generation doesn't hammer
 * the API. On-demand revalidation of the sitemap will re-run this check.
 */
export async function hasPseoInventory(params: PseoCheckParams): Promise<boolean> {
  try {
    // "properties" is the All-Types slug (empty apiValue) — valid, query without a type filter.
    if (!(params.propertyTypeSlug in PSEO_API_TYPE_MAP)) return false;
    const apiType = PSEO_API_TYPE_MAP[params.propertyTypeSlug];

    const qs = new URLSearchParams({
      listingType: params.listingType,
      limit: "1",
      page: "1",
    });
    if (apiType) qs.set("propertyType", apiType);

    if (params.city) qs.set("city", params.city);
    if (params.sublocation) qs.set("location", params.sublocation);
    if (params.bedrooms != null) qs.set("bedrooms", String(params.bedrooms));

    const res = await fetch(`${API_BASE}/properties?${qs.toString()}`, {
      // Cache for 1 hour — sitemap and generateStaticParams only run at
      // build/revalidation time, so this avoids re-fetching identical
      // combinations across multiple invocations in the same build.
      next: { revalidate: 3600, tags: ["pseo-inventory"] },
    } as RequestInit);

    if (!res.ok) return false;
    const data = await res.json();

    // Support both { total } and { data: { total } } envelope shapes
    const total: number =
      typeof data?.total === "number"
        ? data.total
        : typeof data?.data?.total === "number"
        ? data.data.total
        : Array.isArray(data?.items)
        ? data.items.length
        : 0;

    return total >= MIN_PSEO_INVENTORY;
  } catch {
    // Network/parse error: fail open (exclude page) to avoid generating
    // empty PSEO pages if the backend is temporarily unreachable.
    return false;
  }
}

/**
 * Runs inventory checks against a SINGLE bulk snapshot instead of one
 * `GET /properties?limit=1` hydration query (5 LEFT JOINs, full column
 * list) per candidate. Sitemap + generateStaticParams build ~7k
 * candidates, which previously hammered the backend with thousands of
 * heavy queries on every build/revalidation (uncached in `next dev`,
 * so it looked like an infinite aggressive loop in the DB logs).
 *
 * Falls back to per-item checks if the bulk endpoint is unreachable
 * (e.g. old backend), so page generation never hard-fails.
 *
 * Returns an array of booleans in the same order as `items`.
 */
export async function batchHasPseoInventory(
  items: PseoCheckParams[]
): Promise<boolean[]> {
  const bulk = await fetchPseoInventorySnapshot();
  if (bulk) return items.map((p) => snapshotHasInventory(bulk, p));

  const results: boolean[] = [];

  for (let i = 0; i < items.length; i += PSEO_INVENTORY_BATCH_SIZE) {
    const batch = items.slice(i, i + PSEO_INVENTORY_BATCH_SIZE);
    const batchResults = await Promise.all(batch.map((p) => hasPseoInventory(p)));
    results.push(...batchResults);

    // Pause between batches (skip after the last batch)
    if (i + PSEO_INVENTORY_BATCH_SIZE < items.length && PSEO_INVENTORY_BATCH_DELAY_MS > 0) {
      await new Promise((resolve) => setTimeout(resolve, PSEO_INVENTORY_BATCH_DELAY_MS));
    }
  }

  return results;
}

type PseoInventoryRow = {
  listingType: string;
  propertyType: string;
  city: string;
  locality: string | null;
  bedrooms: number | null;
};

const normPlace = (v: string): string =>
  v.toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ").trim();

export async function fetchPseoInventorySnapshot(): Promise<PseoInventoryRow[] | null> {
  try {
    const res = await fetch(`${API_BASE}/properties/pseo-inventory`, {
      // Same ISR window the per-item checks used — sitemap and
      // generateStaticParams only run at build/revalidation time.
      next: { revalidate: 3600, tags: ["pseo-inventory"] },
    } as RequestInit);
    if (!res.ok) return null;
    const data = await res.json();
    const rows: unknown[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.data)
      ? data.data
      : [];
    return rows.filter(
      (r): r is PseoInventoryRow =>
        !!r && typeof (r as any).listingType === "string" && typeof (r as any).propertyType === "string"
    ) as PseoInventoryRow[];
  } catch {
    return null;
  }
}

function snapshotHasInventory(rows: PseoInventoryRow[], params: PseoCheckParams): boolean {
  if (!(params.propertyTypeSlug in PSEO_API_TYPE_MAP)) return false;
  const apiType = PSEO_API_TYPE_MAP[params.propertyTypeSlug];
  const cityNorm = normPlace(params.city || "");
  const locNorm = params.sublocation ? normPlace(params.sublocation) : "";

  let count = 0;
  for (const r of rows) {
    if (r.listingType !== params.listingType) continue;
    if (apiType && r.propertyType !== apiType) continue;
    if (cityNorm && normPlace(r.city || "") !== cityNorm) continue;
    if (locNorm) {
      if (normPlace(r.locality || "") !== locNorm) continue;
      if (params.bedrooms != null && Number(r.bedrooms) !== params.bedrooms) continue;
    }
    count++;
    if (count >= MIN_PSEO_INVENTORY) return true;
  }
  return count >= MIN_PSEO_INVENTORY;
}
