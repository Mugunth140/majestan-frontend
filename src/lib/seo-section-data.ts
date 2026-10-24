import type { Metadata } from "next";
import { SEO_SITE, resolveCanonicalUrl } from "./seo-engine";
type RecordData = Record<string, any>;
export function sectionSeo(record: RecordData, key: string) {
  const sections = record.seoEngine?.section_seo || record.seo?.seoData || {};
  const normalized = key === "map" ? "locality" : key.replaceAll("-", "_");
  return (
    sections[normalized] ||
    (normalized.startsWith("floor_plan")
      ? sections.floor_plans || sections.floor_plan
      : undefined) ||
    {}
  );
}
export function sectionImages(record: RecordData, key: string): string[] {
  if (key.startsWith("floor"))
    return [
      ...(record.floorPlanFiles || []),
      ...(record.details?.floorPlanImages || []),
      ...(record.units || []).flatMap((u: any) => [u, ...(u.floorPlans || [])]),
    ]
      .map((p: any) => p.imageUrl || p.floorPlanImageUrl)
      .filter(Boolean);
  return [
    record.coverImageUrl,
    ...(record.galleryImageUrls || []),
    ...(record.images || []).map((i: any) => i.imageUrl),
  ].filter(Boolean);
}
export function hasSectionData(record: RecordData, section: string): boolean {
  const key = section.replaceAll("-", "_");
  if (key.startsWith("floor_plan"))
    return sectionImages(record, key).length > 0;
  if (key === "photos") return sectionImages(record, key).length > 0;
  if (key === "amenities")
    return (
      (
        record.projectAmenities ||
        record.amenities ||
        record.propertyAmenities ||
        []
      ).length > 0
    );
  if (key === "locality" || key === "map")
    return Boolean(
      record.address ||
      record.sublocation ||
      record.locations?.length ||
      (record.latitude != null && record.longitude != null),
    );
  return true;
}
export function sectionMetadata(
  record: RecordData,
  key: string,
  fallback: Metadata,
): Metadata {
  const child = sectionSeo(record, key);
  const parent = SEO_SITE + "/" + record.canonicalSlug;
  const empty = !hasSectionData(record, key);
  const image = sectionImages(record, key)[0];
  const canonical = resolveCanonicalUrl({
    canonicalType:
      child.canonical_type || (child.canonical_url ? "custom" : "self"),
    customCanonicalUrl: child.canonical_url,
    currentPath:
      "/" +
      record.canonicalSlug +
      "/" +
      (key === "map"
        ? "locality"
        : key === "floor-plan" && record.projectType
          ? "floor-plans"
          : key),
    parentPath: "/" + record.canonicalSlug,
    hasSectionContent: !empty,
  });
  return {
    ...fallback,
    title: child.meta_title ? { absolute: child.meta_title } : fallback.title,
    description: child.meta_description || fallback.description,
    alternates: { ...fallback.alternates, canonical },
    robots:
      empty || record.seoEngine?.gone || record.seoEngine?.robots_index === false || record.seoEngine?.robots_index === 0
        ? { index: false, follow: true }
        : child.robots_index !== undefined
          ? {
              index: Boolean(child.robots_index),
              follow: child.robots_follow !== false && child.robots_follow !== 0,
            }
          : fallback.robots,
    openGraph: {
      ...fallback.openGraph,
      url: canonical,
      ...(image ? { images: [image] } : {}),
    },
    twitter: { ...fallback.twitter, ...(image ? { images: [image] } : {}) },
  };
}
