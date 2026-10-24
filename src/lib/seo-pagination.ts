import type { Metadata } from "next";
import { getSeoForDetail, seoMetadata, SEO_SITE, type SeoSnapshot } from "./seo-engine";

export function listingPageNumber(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const number = Number(raw || 1);
  return Number.isSafeInteger(number) && number > 0 ? number : 1;
}

export function listingMetadata(seo: SeoSnapshot, page: number): Metadata {
  const metadata = seoMetadata(seo);
  if (page <= 1 || (seo.canonical_type && seo.canonical_type !== "self")) return metadata;
  const url = new URL(seo.path, SEO_SITE);
  url.searchParams.set("page", String(page));
  return {
    ...metadata,
    title: { absolute: `${seo.meta_title || seo.h1} | Page ${page}` },
    alternates: { ...metadata.alternates, canonical: url.href },
    openGraph: { ...metadata.openGraph, url: url.href },
  };
}

/** Resolve aliases to their final root before appending a section. Retired roots keep their fallback. */
export async function childRedirect(destination: string, section: string): Promise<string> {
  const seo = await getSeoForDetail(destination);
  return seo && !seo.gone && !seo.off_market && ["property", "project"].includes(seo.scope)
    ? `${seo.path}/${section}`
    : destination;
}
