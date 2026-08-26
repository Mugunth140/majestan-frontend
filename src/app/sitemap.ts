import type { MetadataRoute } from "next";
import { PROPERTY_TYPES } from "@/lib/seo-urls";

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.majestanrealty.com";

const STATIC_ROUTES = [
  "",
  "/about-us",
  "/contact-us",
  "/post-property",
];

const CITIES = ["coimbatore"];

async function getPropertySlugs(): Promise<string[]> {
  try {
    const base = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
    const res = await fetch(`${base}/properties/all-slugs`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    const slugs: string[] = Array.isArray(data) ? data : data.data || data.items || [];
    return slugs.filter(Boolean).map((s: string) => String(s).replace(/^\/+/, ""));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getPropertySlugs();

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

  const listingUrls: MetadataRoute.Sitemap = [];
  const listingTypes: Array<"for-sale" | "for-rent"> = ["for-sale", "for-rent"];
  for (const lt of listingTypes) {
    for (const pt of Object.keys(PROPERTY_TYPES)) {
      if (pt === "properties") continue;
      for (const city of CITIES) {
        listingUrls.push({
          url: `${SITE_URL}/${lt}/${pt}/${city}`,
          lastModified: new Date(),
          changeFrequency: "daily",
          priority: 0.7,
        });
      }
    }
  }

  const staticUrls: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route || "/"}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.5,
  }));

  return [...staticUrls, ...listingUrls, ...propertyUrls, ...sectionUrls];
}
