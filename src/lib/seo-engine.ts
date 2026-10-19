import { SEO_API_BASE } from "./seo-api-base";
import { cache } from "react";
import type { Metadata } from "next";
export const SEO_SITE = "https://www.majestanrealty.com";
export type SeoSnapshot = Record<string, any>;
const base = SEO_API_BASE;
export const seoFetch = cache(async (endpoint: string): Promise<any> => {
  try {
    const r = await fetch(base + "/seo-engine/" + endpoint, {
      cache: "no-store",
      headers: process.env.INTERNAL_API_KEY
        ? { "x-internal-key": process.env.INTERNAL_API_KEY }
        : {},
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) return null;
    const b = await r.json();
    return b && "data" in b ? b.data : b;
  } catch {
    return null;
  }
});
export const getSeo = cache(
  async (path: string): Promise<SeoSnapshot | null> =>
    seoFetch("resolve?path=" + encodeURIComponent(path)),
);
export const getListingSeo = cache(
  async (path: string): Promise<SeoSnapshot | null> =>
    seoFetch("listing-page?path=" + encodeURIComponent(path)),
);
export function seoMetadata(
  seo: SeoSnapshot | null,
  fallback: Metadata = {},
): Metadata {
  if (!seo || seo.redirect) return fallback;
  if (seo.gone) return { ...fallback, robots: { index: false, follow: true } };
  const fallbackTitle =
    typeof fallback.title === "string" ? fallback.title : undefined;
  const title = seo.meta_title || fallbackTitle,
    description = seo.meta_description || fallback.description || undefined;
  const ogTitle = seo.og_title || title,
    ogDescription = seo.og_description || description;
  return {
    ...fallback,
    ...(title ? { title: { absolute: title } } : {}),
    description,
    alternates: {
      ...fallback.alternates,
      canonical: seo.canonical_url || SEO_SITE + seo.path,
    },
    robots: {
      index: seo.robots_index,
      follow: seo.robots_follow,
      googleBot: {
        index: seo.robots_index,
        follow: seo.robots_follow,
        "max-image-preview": "large",
      },
    },
    openGraph: {
      ...fallback.openGraph,
      title: ogTitle,
      description: ogDescription,
      url: seo.canonical_url || SEO_SITE + seo.path,
      ...(seo.og_image_url ? { images: [seo.og_image_url] } : {}),
    },
    twitter: {
      ...fallback.twitter,
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      ...(seo.og_image_url ? { images: [seo.og_image_url] } : {}),
    },
  };
}
export function withSeo<T extends Record<string, any>>(
  record: T,
  seo: SeoSnapshot | null,
): T {
  if (!record || !seo || seo.redirect || seo.gone) return record;
  const overview = {
    ...record.seo?.seoData?.overview,
    ...seo.section_seo?.overview,
    title: seo.meta_title,
    description: seo.meta_description,
    h1: seo.h1,
    og_title: seo.og_title,
    og_description: seo.og_description,
    og_image: seo.og_image_url,
    robots: `${seo.robots_index ? "index" : "noindex"},${seo.robots_follow ? "follow" : "nofollow"}`,
  };
  const result: any = {
    ...record,
    seo: {
      ...record.seo,
      seoData: { ...record.seo?.seoData, ...seo.section_seo, overview },
    },
    canonicalSlug: seo.path.replace(/^\//, ""),
    shouldRedirect: false,
  };
  const altOverrides = seo.image_alt_overrides || {};
  const findAlt = (url?: string | null, ids: string[] = []) => {
    const candidates = [
      ...(url ? [url, `url:${url}`, `url|${url}`] : []),
      ...ids,
    ];
    for (const key of candidates) {
      const value = altOverrides[key];
      if (typeof value === "string" && value.trim()) return value.trim();
    }
    return undefined;
  };
  if (record.images)
    result.images = record.images.map((image: any) => ({
      ...image,
      altText:
        findAlt(image.imageUrl, [
          `property-image:${image.id}`,
          `image:${image.id}`,
          String(image.id),
        ]) || image.altText,
    }));

  const mapPropertyFloorPlans = (plans: any[] = []) =>
    plans.map((plan: any) => ({
      ...plan,
      altText:
        findAlt(plan.imageUrl, [
          ...(plan.id != null ? [`property-floor:${plan.id}`] : []),
          ...(plan.imageKey ? [`property-floor:${plan.imageKey}`] : []),
        ]) || plan.altText,
    }));
  if (record.floorPlanFiles)
    result.floorPlanFiles = mapPropertyFloorPlans(record.floorPlanFiles);
  if (record.details?.floorPlanImages)
    result.details = {
      ...record.details,
      floorPlanImages: mapPropertyFloorPlans(record.details.floorPlanImages),
    };
  if (record.units)
    result.units = record.units.map((unit: any) => ({
      ...unit,
      floorPlanAltText:
        findAlt(unit.floorPlanImageUrl, [
          ...(unit.floorPlanId != null ? [`property-floor:${unit.floorPlanId}`] : []),
          ...(unit.floorPlanImageKey ? [`property-floor:${unit.floorPlanImageKey}`] : []),
        ]) || unit.floorPlanAltText,
    }));

  const isProject = typeof record.projectType === "string";
  if (isProject) {
    result.galleryImageAltOverrides = Object.fromEntries(
      [
        record.coverImageUrl,
        record.mobileCoverImageUrl,
        ...(Array.isArray(record.galleryImageUrls) ? record.galleryImageUrls : []),
      ]
        .filter((url: unknown): url is string => typeof url === "string" && !!url)
        .flatMap((url: string) => {
          const alt = findAlt(url);
          return alt ? [[url, alt]] : [];
        }),
    );
  }
  if (record.units && isProject) {
    result.units = record.units.map((unit: any) => ({
      ...unit,
      floorPlans: unit.floorPlans?.map((plan: any) => ({
        ...plan,
        altText:
          findAlt(plan.imageUrl, [
            ...(plan.id != null ? [`project-floor:${plan.id}`] : []),
            ...(plan.imageKey ? [`project-floor:${plan.imageKey}`] : []),
            `project-floor:${unit.id}`,
          ]) || plan.altText,
      })),
      floorPlanAltText:
        findAlt(unit.floorPlanImageUrl, [
          ...(unit.floorPlanId != null ? [`project-floor:${unit.floorPlanId}`] : []),
          ...(unit.floorPlanImageKey ? [`project-floor:${unit.floorPlanImageKey}`] : []),
          `project-floor:${unit.id}`,
        ]) || unit.floorPlanAltText,
    }));
  }
  if (seo.faqs?.length)
    result.faqs = [
      ...(record.faqs || []).filter((f: any) => f.section !== "overview"),
      ...seo.faqs.map((f: any, i: number) => ({
        ...f,
        id: -i - 1,
        section: "overview",
        sortOrder: i,
      })),
    ];
  if (record.projectFaqs && seo.faqs?.length)
    result.projectFaqs = [
      ...record.projectFaqs.filter(
        (f: any) => (f.section || "overview") !== "overview",
      ),
      ...seo.faqs.map((f: any, i: number) => ({
        ...f,
        id: -i - 1,
        section: "overview",
        sortOrder: i,
      })),
    ];
  return result;
}
export function jsonLd(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
