import { Suspense } from 'react';
import { notFound } from "next/navigation";
import { ListingPage } from "@/components/search/ListingPage";
import { searchProperties } from "@/lib/api";
import { parseListingUrl, toLocationSlug } from "@/lib/seo-urls";
import type { Metadata } from "next";

export const revalidate = 3600;

type Props = {
  params: Promise<{
    propertyType: string;
    location: string[];
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const API_BASE = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

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
  const parsed = parseListingUrl("for-rent", p.propertyType, p.location);
  
  if (!parsed) {
    return { title: "Properties Not Found" };
  }

  const { propertyLabel, city, locality, bedrooms } = parsed;
  const locationLabel = locality ? `${locality}, ${city}` : city;
  const bedroomPrefix = bedrooms ? `${bedrooms} BHK ` : '';
  const canonicalPath = `for-rent/${p.propertyType}/${p.location.join('/')}`;

  const dbSeo = await getListingPageSeo(canonicalPath);

  return {
    title: dbSeo?.metaTitle || `${bedroomPrefix}${propertyLabel} for Rent in ${locationLabel} | Majestan Realty`,
    description: dbSeo?.metaDescription || `Explore the best ${bedroomPrefix.toLowerCase()}${propertyLabel.toLowerCase()} for rent in ${locationLabel}. View prices, photos, and floor plans.`,
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

export default async function ForRentListingPageRoute({ params, searchParams }: Props) {
  const p = await params;
  const sp = await searchParams;
  const parsed = parseListingUrl("for-rent", p.propertyType, p.location);

  if (!parsed) {
    notFound();
  }

  const page = Number(sp.page) || 1;
  const sort = typeof sp.sort === "string" ? sp.sort : "";
  const localitySlug = parsed.locality ? toLocationSlug(parsed.locality) : '';
  const citySlug = toLocationSlug(parsed.city);

  let initialData = null;
  try {
    initialData = await searchProperties(
      {
        listingType: parsed.apiListingType,
        propertyType: parsed.apiPropertyType,
        location: parsed.locality,
        bedrooms: parsed.bedrooms ? String(parsed.bedrooms) : undefined,
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
        name: `${parsed.bedrooms ? parsed.bedrooms + ' BHK ' : ''}${parsed.propertyLabel} for Rent in ${parsed.locality ? parsed.locality + ", " : ""}${parsed.city}`,
        itemListElement: initialData.items.map((item: any, index: number) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `https://www.majestanrealty.com/${item.canonicalSlug || item.slug_url || item.slug || ""}`,
        })),
      }
    : null;

  return (
    <Suspense fallback={<div className="min-h-screen mt-24 text-center">Loading properties...</div>}>
      {itemListJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      )}
      <ListingPage 
        initialListingType={parsed.apiListingType}
        initialPropertyType={parsed.apiPropertyType}
        initialCity={parsed.city}
        initialLocality={parsed.locality}
        initialBedrooms={parsed.bedrooms}
        initialSearchData={initialData}
      />
    </Suspense>
  );
}
