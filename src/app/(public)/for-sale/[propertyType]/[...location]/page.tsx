import { Suspense } from 'react';
import { notFound } from "next/navigation";
import { PropertyListingShell } from "@/components/search/PropertyListingShell";
import type { FilterValues } from "@/components/search/PropertySearchFilters";
import { searchProperties } from "@/lib/api";
import { parseListingUrl, toLocationSlug } from "@/lib/seo-urls";
import type { Metadata } from "next";

export const revalidate = 300;

type Props = {
  params: Promise<{
    propertyType: string;
    location: string[];
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const _abs = (u: string | undefined) => (!!u && /^https?:\/\//i.test(u) ? u : undefined);
const API_BASE = _abs(process.env.API_BASE_URL) || _abs(process.env.NEXT_PUBLIC_API_BASE_URL) || "http://localhost:5000/api/v1";

async function getListingPageSeo(path: string) {
  try {
    const res = await fetch(`${API_BASE}/seo/listing-page?path=${encodeURIComponent(path)}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data ?? data ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await params;
  const parsed = parseListingUrl("for-sale", p.propertyType, p.location);
  
  if (!parsed) {
    return { title: "Properties Not Found" };
  }

  const { propertyLabel, city, locality, bedrooms } = parsed;
  const locationLabel = locality ? `${locality}, ${city}` : city;
  const bedroomPrefix = bedrooms ? `${bedrooms} BHK ` : '';
  const canonicalPath = `for-sale/${p.propertyType}/${p.location.join('/')}`;

  const dbSeo = await getListingPageSeo(canonicalPath);

  return {
    title: dbSeo?.metaTitle || `${bedroomPrefix}${propertyLabel} for Sale in ${locationLabel} | Majestan Realty`,
    description: dbSeo?.metaDescription || `Explore the best ${bedroomPrefix.toLowerCase()}${propertyLabel.toLowerCase()} for sale in ${locationLabel}. View prices, photos, and floor plans.`,
    openGraph: dbSeo?.ogTitle ? {
      title: dbSeo.ogTitle,
      description: dbSeo.ogDescription || undefined,
      images: dbSeo.ogImageUrl ? [{ url: dbSeo.ogImageUrl }] : undefined,
    } : undefined,
    alternates: {
      canonical: `https://www.majestanrealty.com/${canonicalPath}`
    }
  };
}

export default async function ForSaleListingPageRoute({ params, searchParams }: Props) {
  const p = await params;
  const sp = await searchParams;
  const parsed = parseListingUrl("for-sale", p.propertyType, p.location);

  if (!parsed) {
    notFound();
  }

  const page = Number(sp.page) || 1;
  const sort = typeof sp.sort === "string" ? sp.sort : "";
  const localitySlug = parsed.locality ? toLocationSlug(parsed.locality) : '';
  const citySlug = toLocationSlug(parsed.city);

  // Query-string filters must reach the SSR fetch too: after a client-side
  // navigation the remounted shell is seeded with initialData, so the server
  // has to return data matching the URL or the list never updates.
  const qp = (key: string) => typeof sp[key] === "string" && sp[key] ? (sp[key] as string) : undefined;

  let initialData = null;
  try {
    initialData = await searchProperties(
      {
        listingType: parsed.apiListingType,
        propertyType: parsed.apiPropertyType,
        location: parsed.locality,
        propertyName: qp("keyword"),
        minPrice: qp("minPrice"),
        maxPrice: qp("maxPrice"),
        minArea: qp("minArea"),
        maxArea: qp("maxArea"),
        bedrooms: qp("bedrooms") ?? (parsed.bedrooms ? String(parsed.bedrooms) : undefined),
        facing: qp("facing"),
        furnishing: qp("furnishing"),
        propertyAge: qp("propertyAge"),
        page,
        sort,
        limit: 12,
      },
      localitySlug ? [localitySlug, citySlug] : [citySlug],
    );
  } catch (error) {
    console.error("Failed to fetch initial properties", error);
  }

  const itemListJsonLd = initialData?.items?.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `${parsed.bedrooms ? parsed.bedrooms + ' BHK ' : ''}${parsed.propertyLabel} for Sale in ${parsed.locality ? parsed.locality + ", " : ""}${parsed.city}`,
        itemListElement: initialData.items.map((item: any, index: number) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `https://www.majestanrealty.com/${item.canonicalSlug || item.slug_url || item.slug || ""}`,
        })),
      }
    : null;

  const getParam = (key: string) => typeof sp[key] === "string" ? (sp[key] as string) : "";

  const initialFilters: FilterValues = {
    keyword: getParam("keyword"),
    propertyType: parsed.apiPropertyType,
    listingType: parsed.apiListingType,
    location: parsed.locality || "",
    minPrice: getParam("minPrice"),
    maxPrice: getParam("maxPrice"),
    minArea: getParam("minArea"),
    maxArea: getParam("maxArea"),
    bedrooms: getParam("bedrooms") || (parsed.bedrooms ? String(parsed.bedrooms) : ""),
    facing: getParam("facing"),
    furnishing: getParam("furnishing"),
    propertyAge: getParam("propertyAge"),
  };

  return (
    <Suspense fallback={<div className="min-h-screen mt-24 text-center">Loading properties...</div>}>
      {itemListJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      )}
      <PropertyListingShell
        adapterInit={{
          initialListingType: parsed.apiListingType,
          initialPropertyType: parsed.apiPropertyType,
          initialCity: parsed.city,
          initialLocality: parsed.locality,
          initialBedrooms: parsed.bedrooms,
        }}
        initialFilters={initialFilters}
        initialData={initialData}
      />
    </Suspense>
  );
}
