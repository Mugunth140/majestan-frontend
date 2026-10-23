import { SEO_API_BASE } from "./seo-api-base";
import { cache } from "react";
import { notFound } from "next/navigation";
import { seoEndpointTags } from "./public-cache-tags";
import type { Metadata } from "next";
export const SEO_SITE = "https://www.majestanrealty.com";
export type SeoSnapshot = Record<string, any>;
const base = SEO_API_BASE;
// Request memoization is shared by metadata, the page and strict detail checks.
// Fetch caching then reuses public snapshots between requests.
const fetchPublicSeo = cache(async (endpoint: string): Promise<any> => {
  const response = await fetch(base + "/seo-engine/" + endpoint, {
    next: { revalidate: endpoint === "organization" ? 3600 : 60, tags: seoEndpointTags(endpoint) },
    headers: process.env.INTERNAL_API_KEY ? { "x-internal-key": process.env.INTERNAL_API_KEY } : {},
    signal: AbortSignal.timeout(15000),
  });
  // A rejected public path is a missing route, not a rendering outage.
  // Keep server errors/timeouts fatal so incomplete SEO is never cached.
  if (response.status === 400 && endpoint.startsWith("resolve?path=")) notFound();
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Public SEO lookup failed: ${response.status}`);
  const payload = await response.json();
  return payload && "data" in payload ? payload.data : payload;
});
export const seoFetch = cache(async (endpoint: string): Promise<any> => {
  try { return await fetchPublicSeo(endpoint); } catch { return null; }
});
// A transient API failure must not generate a cached detail page with missing SEO.
export const getSeoForDetail = cache((path: string) => fetchPublicSeo("resolve?path=" + encodeURIComponent(path)));
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
      canonical: resolveCanonicalUrl({
        canonicalType:
          seo.canonical_type || (seo.canonical_url ? "custom" : "self"),
        customCanonicalUrl: seo.canonical_url,
        currentPath: seo.path,
        parentPath: seo.parent_path,
      }),
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
      url: resolveCanonicalUrl({
        canonicalType:
          seo.canonical_type || (seo.canonical_url ? "custom" : "self"),
        customCanonicalUrl: seo.canonical_url,
        currentPath: seo.path,
        parentPath: seo.parent_path,
      }),
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
): T & {
  seoEngine?: SeoSnapshot;
  shouldRedirect?: boolean;
  redirectDestination?: string;
} {
  if (!record || !seo) return record;
  if (seo.redirect)
    return {
      ...record,
      shouldRedirect: true,
      redirectDestination: seo.redirect,
    };
  const offMarket =
    Boolean(seo.off_market) ||
    ["sold", "rented", "expired", "inactive", "unpublished"].includes(
      String(record.status).toLowerCase(),
    );
  const policy =
    seo.settings?.expired_redirect_policy || seo.expired_redirect_policy;
  const destination =
    seo.settings?.redirect_target_path || seo.redirect_target_path;
  if (
    offMarket &&
    (policy === "redirect_to_locality" || policy === "redirect_target_path") &&
    destination
  )
    return {
      ...record,
      seoEngine: seo,
      shouldRedirect: true,
      redirectDestination: destination,
    };
  if (seo.gone || (offMarket && policy === "gone"))
    return { ...record, seoEngine: { ...seo, gone: true } };
  if (offMarket && policy === "keep_live_sold_banner")
    seo = { ...seo, off_market: true };

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
    seoEngine: seo,
    seo: {
      ...record.seo,
      seoData: { ...record.seo?.seoData, ...seo.section_seo, overview },
    },
    canonicalSlug: seo.path.replace(/^\//, ""),
    shouldRedirect: false,
  };
  const altOverrides = {
    ...(seo.image_alt_overrides || {}),
    ...(seo.image_alts || {}),
  };
  const findAlt = (url?: string | null, ids: string[] = []) => {
    const candidates = [
      ...(url ? [url, `url:${url}`, `url|${url}`] : []),
      ...ids,
    ];
    for (const key of candidates) {
      const value = altOverrides[key];
      if (typeof value === "string" && value.trim()) return value.trim();
      if (value && typeof value.alt_text === "string" && value.alt_text.trim())
        return value.alt_text.trim();
    }
    return undefined;
  };
  const mediaFields = (url?: string | null, ids: string[] = []) => {
    const keys = [...(url ? [url, `url:${url}`, `url|${url}`] : []), ...ids];
    const entry = keys
      .map((key) => altOverrides[key])
      .find((value) => value && typeof value === "object");
    return entry
      ? {
          titleText: entry.title_text || undefined,
          caption: entry.caption || undefined,
        }
      : {};
  };
  result.seoMedia = Object.fromEntries(
    Object.entries(altOverrides).filter(
      ([, value]) => value && typeof value === "object",
    ),
  );
  if (seo.entity?.brochure_seo_title || seo.settings?.brochure_seo_title) {
    result.brochureSeoTitle =
      seo.entity?.brochure_seo_title || seo.settings?.brochure_seo_title;
  }
  if (record.images)
    result.images = record.images.map((image: any) => ({
      ...image,
      ...mediaFields(image.imageUrl, [
        `property-image:${image.id}`,
        `image:${image.id}`,
        String(image.id),
      ]),
      altText:
        findAlt(image.imageUrl, [
          `property-image:${image.id}`,
          `image:${image.id}`,
          String(image.id),
        ]) || image.altText,
    }));

  const mapPropertyFloorPlans = (plans: any[] = []) =>
    plans.map((plan: any, index: number) => ({
      ...plan,
      ...mediaFields(plan.imageUrl, [
        `property-file:${plan.id}`,
        `property-floor:${index}`,
        `property-floor:${plan.id}`,
        `property-floor:${plan.imageKey}`,
      ]),
      altText:
        findAlt(plan.imageUrl, [
          ...(plan.id != null
            ? [`property-file:${plan.id}`, `property-floor:${plan.id}`]
            : []),
          `property-floor:${index}`,
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
      ...(() => {
        const media = mediaFields(unit.floorPlanImageUrl, [
          `property-unit:${unit.id}`,
          `property-floor:${unit.floorPlanId}`,
          `property-floor:${unit.floorPlanImageKey}`,
        ]);
        return {
          floorPlanTitleText: media.titleText,
          floorPlanCaption: media.caption,
        };
      })(),
      floorPlanAltText:
        findAlt(unit.floorPlanImageUrl, [
          `property-unit:${unit.id}`,
          ...(unit.floorPlanId != null
            ? [`property-floor:${unit.floorPlanId}`]
            : []),
          ...(unit.floorPlanImageKey
            ? [`property-floor:${unit.floorPlanImageKey}`]
            : []),
        ]) || unit.floorPlanAltText,
    }));

  const isProject = typeof record.projectType === "string";
  if (isProject) {
    const projectImageKeys = (url: string) => [
      ...(url === record.coverImageUrl ? ["project-cover"] : []),
      ...(url === record.mobileCoverImageUrl ? ["project-mobile-cover"] : []),
      ...((record.galleryImageUrls || []).includes(url)
        ? [`project-image:${record.galleryImageUrls.indexOf(url)}`]
        : []),
    ];
    result.galleryImageSeo = Object.fromEntries(
      [
        record.coverImageUrl,
        record.mobileCoverImageUrl,
        ...(record.galleryImageUrls || []),
      ]
        .filter(Boolean)
        .map((url: string) => [url, mediaFields(url, projectImageKeys(url))]),
    );
    result.galleryImageAltOverrides = Object.fromEntries(
      [
        record.coverImageUrl,
        record.mobileCoverImageUrl,
        ...(Array.isArray(record.galleryImageUrls)
          ? record.galleryImageUrls
          : []),
      ]
        .filter(
          (url: unknown): url is string => typeof url === "string" && !!url,
        )
        .flatMap((url: string) => {
          const alt = findAlt(url, projectImageKeys(url));
          return alt ? [[url, alt]] : [];
        }),
    );
  }
  if (record.units && isProject) {
    result.units = record.units.map((unit: any) => ({
      ...unit,
      ...(() => {
        const media = mediaFields(unit.floorPlanImageUrl, [
          `project-floor:${unit.id}`,
        ]);
        return {
          floorPlanTitleText: media.titleText,
          floorPlanCaption: media.caption,
        };
      })(),
      floorPlans: unit.floorPlans?.map((plan: any, index: number) => ({
        ...plan,
        ...mediaFields(plan.imageUrl, [
          `project-floor:${unit.id}:${index}`,
          `project-floor:${plan.id}`,
          `project-floor:${plan.imageKey}`,
          `project-floor:${unit.id}`,
        ]),
        altText:
          findAlt(plan.imageUrl, [
            `project-floor:${unit.id}:${index}`,
            ...(plan.id != null ? [`project-floor:${plan.id}`] : []),
            ...(plan.imageKey ? [`project-floor:${plan.imageKey}`] : []),
            `project-floor:${unit.id}`,
          ]) || plan.altText,
      })),
      floorPlanAltText:
        findAlt(unit.floorPlanImageUrl, [
          `property-unit:${unit.id}`,
          ...(unit.floorPlanId != null
            ? [`project-floor:${unit.floorPlanId}`]
            : []),
          ...(unit.floorPlanImageKey
            ? [`project-floor:${unit.floorPlanImageKey}`]
            : []),
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

/** JSON-LD for listings only describes the visible results, without hidden FAQs. */
export function listingStructuredData(
  seo: SeoSnapshot | null,
  itemList: Record<string, unknown>,
) {
  const graph = seo?.json_ld?.["@graph"];
  if (!Array.isArray(graph))
    return { "@context": "https://schema.org", ...itemList };
  return {
    ...seo?.json_ld,
    "@graph": [
      ...graph.filter((node: any) => {
        const types = Array.isArray(node?.["@type"])
          ? node["@type"]
          : [node?.["@type"]];
        return !types.includes("FAQPage") && !types.includes("ItemList");
      }),
      itemList,
    ],
  };
}

export function resolveCanonicalUrl(options: {
  canonicalType?: "self" | "parent" | "custom";
  customCanonicalUrl?: string | null;
  currentPath: string;
  parentPath?: string;
  hasSectionContent?: boolean;
}): string {
  const site = (process.env.NEXT_PUBLIC_SEO_SITE || SEO_SITE).replace(
    /\/$/,
    "",
  );
  const clean = (p: string) =>
    new URL(p, site).pathname.replace(/\/+$/, "") || "/";
  if (
    options.hasSectionContent === false &&
    options.canonicalType !== "custom" &&
    options.parentPath
  )
    return site + clean(options.parentPath);
  if (
    options.canonicalType === "custom" &&
    options.customCanonicalUrl?.trim()
  ) {
    try {
      const u = new URL(options.customCanonicalUrl, site);
      if (
        ["https:", "http:"].includes(u.protocol) &&
        !u.username &&
        !u.password
      )
        return u.href;
    } catch {}
  }
  return (
    site +
    clean(
      options.canonicalType === "parent"
        ? options.parentPath || options.currentPath
        : options.currentPath,
    )
  );
}
