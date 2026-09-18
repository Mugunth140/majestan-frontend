import type { MetadataRoute } from "next";
import {
  PROPERTY_TYPES,
  buildPseoSlug,
  PSEO_BEDROOM_OPTIONS,
  BEDROOM_PROPERTY_TYPE_SLUGS,
  type PropertyTypeSlug,
} from "@/lib/seo-urls";
import { batchHasPseoInventory, type PseoCheckParams } from "@/lib/pseo-inventory";

export const revalidate = 3600;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.majestanrealty.com";
const _abs = (u: string | undefined) =>
  !!u && /^https?:\/\//i.test(u) ? u : undefined;
const API_BASE =
  _abs(process.env.API_BASE_URL) ||
  _abs(process.env.NEXT_PUBLIC_API_BASE_URL) ||
  "http://localhost:5000/api/v1";

const STATIC_ROUTES = ["", "/about-us", "/contact-us", "/post-property"];

const CITIES = ["coimbatore"];

// Property type slugs eligible for PSEO pages (exclude the "properties" catch-all)
const PSEO_PROPERTY_TYPE_SLUGS = Object.keys(PROPERTY_TYPES).filter(
  (k) => k !== "properties" && PROPERTY_TYPES[k as PropertyTypeSlug].apiValue !== ""
) as PropertyTypeSlug[];

async function getPropertySlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/properties/all-slugs`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const slugs: string[] = Array.isArray(data)
      ? data
      : data.data || data.items || [];
    return slugs.filter(Boolean).map((s: string) => String(s).replace(/^\/+/, ""));
  } catch {
    return [];
  }
}

async function getProjectSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/projects/all-slugs`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const slugs: string[] = Array.isArray(data)
      ? data
      : data.data || data.items || [];
    return slugs.filter(Boolean).map((s: string) => String(s).replace(/^\/+/, ""));
  } catch {
    return [];
  }
}

async function getSublocations(): Promise<
  Array<{ sublocation: string; city: string }>
> {
  try {
    const res = await fetch(`${API_BASE}/metadata/sublocations`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items = Array.isArray(data) ? data : data.data || data.items || [];
    return items.filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, sublocations, projectSlugs] = await Promise.all([
    getPropertySlugs(),
    getSublocations(),
    getProjectSlugs(),
  ]);

  // ── Static routes ──────────────────────────────────────────────────────────
  const staticUrls: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route || "/"}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.5,
  }));

  // ── Project pages ─────────────────────────────────────────────────────────
  const projectUrls: MetadataRoute.Sitemap = projectSlugs.map((slug) => ({
    url: `${SITE_URL}/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // ── Property detail pages ─────────────────────────────────────────────────
  const propertyUrls: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${SITE_URL}/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const sectionUrls: MetadataRoute.Sitemap = slugs.flatMap((slug) =>
    ["amenities", "photos", "floor-plan", "locality"].map((section) => ({
      url: `${SITE_URL}/${slug}/${section}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))
  );

  // ── PSEO listing pages (inventory-gated, new URL format) ──────────────────
  //
  // Build every candidate combination, then run inventory checks in parallel
  // batches to avoid overloading the API. Only include pages with sufficient
  // inventory (>= MIN_PSEO_INVENTORY, default 1).
  //
  // BHK pages: 2/3/4 only — 1 BHK is excluded from PSEO indexing.
  const listingTypes: Array<"Sell" | "Rent"> = ["Sell", "Rent"];

  type PseoCandidate = {
    slug: string;
    params: PseoCheckParams;
  };

  const candidates: PseoCandidate[] = [];

  for (const city of CITIES) {
    const citySublocations = sublocations.filter(
      (s) => s.city.toLowerCase() === city.toLowerCase()
    );

    for (const lt of listingTypes) {
      for (const ptSlug of PSEO_PROPERTY_TYPE_SLUGS) {
        // City-level page (no sublocation)
        candidates.push({
          slug: buildPseoSlug(lt, ptSlug, city),
          params: { listingType: lt, propertyTypeSlug: ptSlug, city },
        });

        // Sublocation-level pages
        for (const sub of citySublocations) {
          candidates.push({
            slug: buildPseoSlug(lt, ptSlug, city, sub.sublocation),
            params: {
              listingType: lt,
              propertyTypeSlug: ptSlug,
              city,
              sublocation: sub.sublocation,
            },
          });

          // BHK-segmented pages — residential types only, 2/3/4 BHK
          if (BEDROOM_PROPERTY_TYPE_SLUGS.includes(ptSlug)) {
            for (const bhk of PSEO_BEDROOM_OPTIONS) {
              candidates.push({
                slug: buildPseoSlug(lt, ptSlug, city, sub.sublocation, bhk),
                params: {
                  listingType: lt,
                  propertyTypeSlug: ptSlug,
                  city,
                  sublocation: sub.sublocation,
                  bedrooms: bhk,
                },
              });
            }
          }
        }
      }
    }
  }

  // Run inventory checks in small sequential batches to avoid 429s
  const allParams = candidates.map((c) => c.params);
  const allResults = await batchHasPseoInventory(allParams);
  const listingUrls: MetadataRoute.Sitemap = [];
  for (let j = 0; j < candidates.length; j++) {
    if (allResults[j]) {
      listingUrls.push({
        url: `${SITE_URL}/${candidates[j].slug}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: candidates[j].params.bedrooms
          ? 0.8
          : candidates[j].params.sublocation
          ? 0.75
          : 0.7,
      });
    }
  }

  return [
    ...staticUrls,
    ...listingUrls,
    ...propertyUrls,
    ...sectionUrls,
    ...projectUrls,
  ];
}
